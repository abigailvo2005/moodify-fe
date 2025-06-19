// src/components/CustomModalPicker.tsx 
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { User } from "../types";
import { deleteFriend } from "../services/apiSwitch"; // ← ADD: Import delete API

type CustomModalPickerProps = {
  list: User[];
  selectedId: string;
  onValueChange: (id: string) => void;
  currentUserId?: string; // ← ADD: Current user ID for delete functionality
  onFriendDeleted?: () => void; // ← ADD: Callback when friend is deleted
  enableDelete?: boolean; // ← ADD: Flag to enable/disable delete functionality
};

const CustomModalPicker: React.FC<CustomModalPickerProps> = ({
  list,
  selectedId,
  onValueChange,
  currentUserId,
  onFriendDeleted,
  enableDelete = false, // ← ADD: Default to false for backward compatibility
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [deletingFriendId, setDeletingFriendId] = useState<string | null>(null); // ← ADD: Track deleting state

  // Find selected user name
  const selectedUser = list.find(
    (listElement) => listElement.id === selectedId
  );
  const selectedName = selectedUser ? selectedUser.name : "Select user...";

  const handleSelect = (item: User) => {
    if (item.id) {
      onValueChange(item.id);
      setModalVisible(false);
    }
  };

  // ← ADD: Handle friend deletion
  const handleDeleteFriend = async (friendId: string, friendName: string) => {
    if (!currentUserId || friendId === currentUserId) {
      return; // Can't delete yourself or if no current user
    }

    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friendName} from your friends list? You can always reconnect later! 💔`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingFriendId(friendId);
              console.log("🗑️ Deleting friend:", friendName);

              const success = await deleteFriend(currentUserId, friendId);

              if (success) {
                Alert.alert(
                  "Friend Removed! 👋",
                  `${friendName} has been removed from your friends list.`
                );

                // If we're currently viewing the deleted friend's moods, switch to current user
                if (selectedId === friendId) {
                  onValueChange(currentUserId);
                }

                // Trigger refresh in parent component
                if (onFriendDeleted) {
                  onFriendDeleted();
                }
              } else {
                Alert.alert(
                  "Error",
                  "Failed to remove friend. Please try again."
                );
              }
            } catch (error) {
              console.log("❌ Delete friend error:", error);
              Alert.alert(
                "Error",
                "Failed to remove friend. Please try again."
              );
            } finally {
              setDeletingFriendId(null);
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: User }) => {
    const isSelected = item.id === selectedId;
    const isCurrentUser = item.id === currentUserId;
    const isDeletingThisFriend = deletingFriendId === item.id;

    return (
      <View style={[styles.modalItem, isSelected && styles.selectedItem]}>
        {/* ← UPDATE: Main touchable area for selection */}
        <TouchableOpacity
          style={styles.selectableArea}
          onPress={() => handleSelect(item)}
          disabled={isDeletingThisFriend}
        >
          <Text
            style={[styles.modalItemText, isSelected && styles.selectedText]}
          >
            {isCurrentUser ? "You" : item.name}
          </Text>
          {isSelected && <Icon name="checkmark" size={20} color="#9e5a86" />}
        </TouchableOpacity>

        {/* ← ADD: Delete button (only for friends, not current user) */}
        {enableDelete && !isCurrentUser && currentUserId && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              isDeletingThisFriend && styles.deleteButtonDisabled,
            ]}
            onPress={() => handleDeleteFriend(item.id!, item.name)}
            disabled={isDeletingThisFriend}
          >
            {isDeletingThisFriend ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Icon name="person-remove" size={18} color="#FF3B30" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View>
      {/* Picker Button */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>{selectedName}</Text>
        <Icon name="chevron-down" size={20} color="#718096" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {enableDelete ? "Manage Friends" : "Choose Your Friend"}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
              data={list}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={renderItem}
              style={styles.modalList}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerLabel: {
    fontSize: 14,
    fontFamily: "FredokaSemiBold",
    color: "#4A5568",
    marginBottom: 5,
  },
  pickerButton: {
    backgroundColor: "#d7e1f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bed2ed",
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#5787e6",
    fontFamily: "FredokaSemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    minHeight: 340,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "FredokaSemiBold",
    color: "#2D3748",
  },
  closeButton: {
    padding: 5,
  },

  // ← ADD: Instructions styles
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  instructionsText: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    textAlign: "center",
    fontStyle: "italic",
  },

  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row", // ← UPDATE: Row layout for selection + delete
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  selectedItem: {
    backgroundColor: "#F8F4FF",
  },

  // ← ADD: Selectable area styles
  selectableArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 10,
  },

  modalItemText: {
    fontSize: 16,
    color: "#2D3748",
    fontFamily: "Fredoka",
  },
  selectedText: {
    color: "#9e5a86",
    fontFamily: "FredokaSemiBold",
  },

  // ← ADD: Delete button styles
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "rgba(255, 59, 48, 0.05)",
  },
});

export default CustomModalPicker;
