import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { User } from "../types"; // Adjust the import path as necessary

type CustomModalPickerProps = {
  list: User[];
  selectedId: string;
  onValueChange: (id: string) => void;
};

const CustomModalPicker: React.FC<CustomModalPickerProps> = ({
  list,
  selectedId,
  onValueChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Find selected user name
  const selectedUser = list.find(
    (listElement) => listElement.id === selectedId
  );
  const selectedName = selectedUser ? selectedUser.name : "Select user...";

  const handleSelect = (item: User) => {
    onValueChange(item.id);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: User }) => {
    const isSelected = item.id === selectedId;

    return (
      <TouchableOpacity
        style={[styles.modalItem, isSelected && styles.selectedItem]}
        onPress={() => handleSelect(item)}
      >
        <Text style={[styles.modalItemText, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
        {isSelected && <Icon name="checkmark" size={20} color="#9e5a86" />}
      </TouchableOpacity>
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Your Friend</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
              data={list}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={styles.modalList}
            />
          </View>
        </View>
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
    minHeight: 700,
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
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  selectedItem: {
    backgroundColor: "#F8F4FF",
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
});

export default CustomModalPicker;
