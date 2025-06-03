import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getMoods, getFriends, getUserById, getUsersByIds } from "../services/api";
import { Mood, User } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import MoodCard from "../components/MoodCard";
import Icon from "react-native-vector-icons/Ionicons";
import { formatDate } from "../utils/formatDate";
import CustomModalPicker from "../components/CustomModalPicker";
import { ROUTES } from "../constants";

export default function MoodListScreen({ navigation }: any) {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch friends and moods when the user is logged in
  useEffect(() => {
    if (user) {
      setSelectedUserId(user.id);
      fetchFriends();
    }
  }, [user]);

  // Fetch moods when the selected user - friends changes
  useEffect(() => {
    if (selectedUserId) {
      fetchMoods();
    }
  }, [selectedUserId]);

  // Fetch friends list and include the current user as "Me"
  const fetchFriends = async () => {
    try {
      if (user) {
        const userFriendsIds = user.friends ?? [];
        const friendsData = await getUsersByIds(userFriendsIds);
        const flatFriends = Array.isArray(friendsData) ? friendsData : [];
        setFriends([user, ...flatFriends]); // Include current user in the list
      }
    } catch (error) {
      console.log("Error fetching friends:", error);
    }
  };

  // Fetch moods for the selected user
  const fetchMoods = async () => {
    try {
      setLoading(true);
      if (selectedUserId) {
        const userMoods = await getMoods(selectedUserId);
        // Sort moods by date (newest first)
        const sortedMoods = userMoods.sort(
          (a: Mood, b: Mood) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMoods(sortedMoods);
      }
    } catch (error) {
      console.log("Error fetching moods:", error);
      Alert.alert("Error", "Failed to fetch moods");
    } finally {
      setLoading(false);
    }
  };

  // Group moods by date
  const groupMoodsByDate = () => {
    const grouped: { [key: string]: Mood[] } = {};

    // Convert mood dates to strings for grouping
    moods.forEach((mood) => {
      const dateKey = new Date(mood.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(mood);
    });

    return grouped;
  };

  // Render date separator with formatted date
  const renderDateSeparator = (dateString: string) => (
    <View style={styles.dateSeparator}>
      <Text style={styles.dateText}>{formatDate(dateString, true)}</Text>
    </View>
  );

  // Render each mood card
  const renderMoodCard = ({ item }: { item: Mood }) => {
    const currentUserId = user?.id;

    // Only show public mood to friends
    if (
      item.userId === currentUserId ||
      (item.userId !== currentUserId && item.isPrivate === false)
    ) {
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("MoodDetail", {
              moodId: item.id,
              onMoodUpdated: fetchMoods, // Callback to refresh moods after editing
            })
          }
        >
          <MoodCard mood={item} />
        </TouchableOpacity>
      );
    }
    // If not allowed to show, render nothing
    return null;
  };

  // Prepare data for FlatList - this will include date separators and mood cards
  const renderFlatListData = () => {
    const groupedMoods = groupMoodsByDate();
    const flatData: any[] = [];

    Object.keys(groupedMoods)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach((dateKey) => {
        // Add date separator
        flatData.push({
          type: "date",
          date: dateKey,
          id: `date-${dateKey}`,
        });

        // Add moods for this date
        groupedMoods[dateKey].forEach((mood) => {
          flatData.push({
            type: "mood",
            ...mood,
          });
        });
      });

    return flatData;
  };

  // Render each item in the FlatList
  // It can be either a date separator or a mood card
  const renderItem = ({ item }: any) => {
    if (item.type === "date") {
      return renderDateSeparator(item.date);
    } else {
      return renderMoodCard({ item });
    }
  };

  // Render empty state when there are no moods
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="happy-outline" size={80} color="#CBD5E0" />
      <Text style={styles.emptyTitle}>No moods yet</Text>
      <Text style={styles.emptySubtitle}>
        {selectedUserId === user?.id
          ? "Start tracking your mood to see your emotional journey"
          : `${
              friends.find((f) => f.id === selectedUserId)?.name || "This user"
            } hasn't shared any moods yet`}
      </Text>
      {selectedUserId === user?.id && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateMood")}
        >
          <Text style={styles.createButtonText}>Create Your First Mood</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Determine the selected user's name for display
  const selectedUserName =
    selectedUserId === user?.id
      ? "your"
      : `${friends.find((f) => f.id === selectedUserId)?.name || "user"}'s`;

  // Main component render
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          {/* Heading */}
          <Text style={styles.title}>Mood Diary</Text>

          {/* Add New Mood Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate(ROUTES.CREATE_MOOD)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Add Mood +</Text>
          </TouchableOpacity>
        </View>

        {/* Friends Selection Dropdown */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Viewing:</Text>
          <View>
            {/* Custom Dropdown TO Choose Friends */}
            <CustomModalPicker
              list={friends}
              selectedId={selectedUserId}
              onValueChange={setSelectedUserId}
            />
          </View>
        </View>

        <Text style={styles.subtitle}>
          {moods.length} of {selectedUserName} moods were captured
        </Text>
      </View>

      {/* MOOD LIST */}
      {moods.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={renderFlatListData()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={loading}
          onRefresh={fetchMoods}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Button Styles
  primaryButton: {
    backgroundColor: "rgba(243, 180, 196, 0.72)",
    paddingVertical: 16,
    width: 150,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "FredokaSemiBold", // Make sure this font is loaded
    color: "rgba(93, 22, 40, 0.72)",
    fontWeight: "600",
  },
  headerContainer: {
    flexDirection: "row", 
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: "FredokaSemiBold",
    color: "#7d2a4b",
    marginBottom: 15,
    fontWeight: "bold",
    textShadowColor: "#ad9aa2",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },

  // Picker section
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 14,
    fontFamily: "FredokaSemiBold",
    color: "#4A5568",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "FredokaSemiBold",
    color: "#718096",
  },

  // Flatlist style
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 8,
  },
  dateSeparator: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#9170b3",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "FredokaSemiBold",
    color: "#562b82",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "FredokaSemiBold",
    color: "#2D3748",
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Fredoka",
    color: "#718096",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: "#9e5a86",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#753860",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "FredokaSemiBold",
  },
});
