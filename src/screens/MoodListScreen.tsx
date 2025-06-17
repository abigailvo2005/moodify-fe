import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  getMoods,
  getFriends,
  getUserById,
  getUsersByIds,
} from "../services/apiSwitch";
import { Mood, User } from "../types";
import { useAuth } from "../contexts/AuthContext";
import MoodCard from "../components/MoodCard";
import Icon from "react-native-vector-icons/Ionicons";
import { formatDate } from "../utils/formatDate";
import CustomModalPicker from "../components/CustomModalPicker";
import { ROUTES } from "../constants";
import { useFocusEffect } from "expo-router";

export default function MoodListScreen({ navigation }: any) {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Initial app load
  const [friendsLoaded, setFriendsLoaded] = useState(false); // Track if friends are loaded
  const [moodsLoaded, setMoodsLoaded] = useState(false); // Track if moods are loaded
  const { user } = useAuth();

  // Fetch friends and moods when the user is logged in
  useEffect(() => {
    if (user) {
      setSelectedUserId(user?.id || "");
      initializeScreen();
    }
  }, [user]);

  // Auto-refresh moods when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (selectedUserId && friendsLoaded) {
        fetchMoods();
      }
    }, [selectedUserId, friendsLoaded])
  );

  // Fetch moods when the selected user changes (but not on initial load)
  useEffect(() => {
    if (selectedUserId && friendsLoaded) {
      fetchMoods();
    }
  }, [selectedUserId, friendsLoaded]);

  // ← NEW: Combined initialization function
  const initializeScreen = async () => {
    try {
      console.log("🔄 Initializing MoodListScreen...");
      setInitialLoading(true);
      setFriendsLoaded(false);
      setMoodsLoaded(false);

      // Step 1: Fetch friends first
      console.log("📥 Fetching friends...");
      await fetchFriends();

      // Step 2: Then fetch moods (will be triggered by useEffect)
      // The useEffect will handle this when friendsLoaded becomes true
    } catch (error) {
      console.log("❌ Error initializing screen:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
      setInitialLoading(false);
    }
  };

  // ← UPDATED: Better friends fetching with completion tracking
  const fetchFriends = async () => {
    try {
      console.log("👥 Starting fetchFriends...");
      setLoading(true);

      if (user) {
        const userFriendsIds = user.friends ?? [];
        console.log(`📋 User has ${userFriendsIds.length} friends`);

        let friendsData: User[] = [];
        if (userFriendsIds.length > 0) {
          console.log("🔍 Fetching friends data...");
          friendsData = await getUsersByIds(userFriendsIds);
        }

        const flatFriends = Array.isArray(friendsData) ? friendsData : [];
        const allUsers = [user, ...flatFriends]; // Include current user in the list

        console.log(`✅ Friends loaded: ${allUsers.length} total users`);
        setFriends(allUsers);
        setFriendsLoaded(true); // Mark friends as loaded
      }
    } catch (error) {
      console.log("❌ Error fetching friends:", error);
      Alert.alert("Error", "Failed to load friends");
      setInitialLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // ← UPDATED: Better moods fetching with completion tracking
  const fetchMoods = async () => {
    try {
      console.log(`🎭 Starting fetchMoods for user: ${selectedUserId}`);
      setLoading(true);
      setMoodsLoaded(false);

      if (selectedUserId) {
        console.log("📥 Fetching moods from API...");
        const userMoods = await getMoods(selectedUserId);

        // Sort moods by date (newest first)
        const sortedMoods = userMoods.sort(
          (a: Mood, b: Mood) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        console.log(`✅ Moods loaded: ${sortedMoods.length} moods`);
        setMoods(sortedMoods);
        setMoodsLoaded(true); // Mark moods as loaded

        // ← NEW: Only turn off initial loading when BOTH friends and moods are loaded
        if (friendsLoaded && initialLoading) {
          console.log("🎉 Initial loading complete!");
          setInitialLoading(false);
        }
      }
    } catch (error) {
      console.log("❌ Error fetching moods:", error);
      Alert.alert("Error", "Failed to fetch moods");
      setInitialLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // ← UPDATED: Enhanced loading screen with better messaging
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(243, 180, 196, 0.8)" />
        <Text style={styles.loadingText}>
          {!friendsLoaded ? "Loading friends..." : "Loading moods..."}
        </Text>
        <Text style={styles.loadingSubtext}>
          {!friendsLoaded
            ? "Getting your connections..."
            : `Fetching ${
                friends.find((f) => f.id === selectedUserId)?.name || "user"
              }'s moods...`}
        </Text>
      </View>
    );
  }

  // ← NEW: Show error state if friends failed to load
  if (friendsLoaded && friends.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={80} color="#F56565" />
        <Text style={styles.errorTitle}>Unable to load friends</Text>
        <Text style={styles.errorSubtext}>
          Please check your connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeScreen}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          onPress={() => {
            navigation.navigate("MoodDetail", {
              moodId: item.id,
              onMoodUpdated: fetchMoods, // Callback to refresh moods after editing
            });
          }}
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
      {moods.length === 0 && moodsLoaded ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={renderFlatListData()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={loading && !initialLoading}
          onRefresh={() => {
            console.log("🔄 Manual refresh triggered");
            fetchMoods();
          }}
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

  // Loading container styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingTop: 20,
  },

  loadingText: {
    fontSize: 18,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginTop: 16,
    textAlign: "center",
  },

  // ← NEW: Loading subtext
  loadingSubtext: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    marginTop: 8,
    textAlign: "center",
  },

  // ← NEW: Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 40,
  },

  errorTitle: {
    fontSize: 20,
    color: "#F56565",
    fontFamily: "FredokaSemiBold",
    marginTop: 16,
    textAlign: "center",
  },

  errorSubtext: {
    fontSize: 16,
    color: "#718096",
    fontFamily: "Fredoka",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 20,
  },

  retryButtonText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontSize: 16,
    fontFamily: "FredokaSemiBold",
  },

  // ← NEW: Refreshing indicator
  refreshingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  refreshingText: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "Fredoka",
    marginLeft: 8,
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
    fontFamily: "FredokaSemiBold",
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
