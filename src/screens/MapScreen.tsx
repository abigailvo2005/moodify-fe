import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import LottieView from "lottie-react-native";
import { useAuth } from "../contexts/AuthContext";
import { getMoods, getUsersByIds } from "../services/apiSwitch";
import { Mood, User, LocationData } from "../types";
import { MOOD_ICONS } from "../constants";
import { formatDate } from "../utils/formatDate";
import { useFocusEffect } from "expo-router";

const { width, height } = Dimensions.get("window");

interface FriendMoodPin {
  friend: User;
  mood: Mood;
  location: LocationData;
}

// Custom Mood Marker Component
const MoodMarker = ({
  pin,
  onPress,
}: {
  pin: FriendMoodPin;
  onPress: () => void;
}) => {
  // Find the corresponding mood icon
  const moodIcon = MOOD_ICONS.find(
    (icon) => icon.label.toLowerCase() === pin.mood.mood.toLowerCase()
  );

  const isCurrentUser = pin.friend.id === pin.friend.id; // You'll need to pass current user ID

  return (
    <TouchableOpacity
      style={[
        styles.moodMarkerContainer,
        isCurrentUser && styles.currentUserMarker,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Background Circle */}
      <View
        style={[
          styles.moodMarkerBackground,
          { backgroundColor: getMoodColor(pin.mood.mood) },
        ]}
      >
        {/* Mood Animation */}
        {moodIcon && (
          <LottieView
            source={moodIcon.animation}
            style={styles.moodAnimation}
            autoPlay
            loop
          />
        )}
      </View>

      {/* User Name */}
      <View style={styles.moodMarkerNameContainer}>
        <Text style={styles.moodMarkerName} numberOfLines={1}>
          {pin.friend.name}
        </Text>
      </View>

      {/* Pulse Effect */}
      <View
        style={[
          styles.pulseEffect,
          { backgroundColor: getMoodColor(pin.mood.mood) },
        ]}
      />
    </TouchableOpacity>
  );
};

export default function MapScreen({ navigation }: any) {
  const [friendMoodPins, setFriendMoodPins] = useState<FriendMoodPin[]>([]);
  const [friendsWithoutLocation, setFriendsWithoutLocation] = useState<User[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.7769, // Default to Ho Chi Minh City
    longitude: 106.7009,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const { user } = useAuth();
  const mapRef = React.useRef<MapView>(null);

  useEffect(() => {
    fetchFriendsLocation();
    getCurrentLocation();
  }, [user]);

  // Refetch friends' locations every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchFriendsLocation();
    }, [user])
  );

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  // Helper to focus map on current user's latest mood
  const focusOnCurrentUserMood = () => {
    const currentUserPin = friendMoodPins.find(
      (pin) => pin.friend.id === user?.id
    );
    if (currentUserPin) {
      mapRef.current?.animateToRegion(
        {
          latitude: currentUserPin.location.latitude,
          longitude: currentUserPin.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800 // duration in ms
      );
    } else {
      Alert.alert(
        "No mood location",
        "You don't have a mood with location yet."
      );
    }
  };

  const fetchFriendsLocation = async () => {
    try {
      setLoading(true);

      if (!user?.friends || user.friends.length === 0) {
        // Also include current user's moods
        await fetchUserMoods(user);
        setLoading(false);
        return;
      }

      // Get all friends data + current user
      const allUserIds = [...(user.friends || []), user.id].filter(
        (id): id is string => id !== undefined
      );
      const allUsers = await getUsersByIds(allUserIds);

      // Get all users' moods (including current user)
      const userMoodsPromises = allUsers.map(async (currentUser) => {
        const moods = await getMoods(currentUser.id || "");
        return { friend: currentUser, moods };
      });

      const userMoodsData = await Promise.all(userMoodsPromises);

      const pinsData: FriendMoodPin[] = [];
      const usersWithoutLocationData: User[] = [];

      userMoodsData.forEach(({ friend, moods }) => {
        // Filter for public moods with location (or all moods if it's current user)
        const moodsWithLocation = moods.filter((mood: Mood) => {
          const isCurrentUser = friend.id === user.id;
          return (
            mood.hasLocation &&
            mood.location &&
            (isCurrentUser || !mood.isPrivate)
          ); // Show private moods only for current user
        });

        if (moodsWithLocation.length > 0) {
          // Get the latest mood with location
          const latestMood = moodsWithLocation.sort(
            (a: Mood, b: Mood) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

          pinsData.push({
            friend,
            mood: latestMood,
            location: latestMood.location!,
          });
        } else {
          // User has no moods with location
          usersWithoutLocationData.push(friend);
        }
      });

      setFriendMoodPins(pinsData);
      setFriendsWithoutLocation(usersWithoutLocationData);
    } catch (error) {
      console.log("Error fetching friends location:", error);
      Alert.alert("Error", "Failed to load friends' locations");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMoods = async (currentUser: any) => {
    try {
      const moods = await getMoods(currentUser.id || "");
      const moodsWithLocation = moods.filter(
        (mood: Mood) => mood.hasLocation && mood.location
      );

      if (moodsWithLocation.length > 0) {
        const latestMood = moodsWithLocation.sort(
          (a: Mood, b: Mood) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        setFriendMoodPins([
          {
            friend: currentUser,
            mood: latestMood,
            location: latestMood.location!,
          },
        ]);
      }
    } catch (error) {
      console.log("Error fetching user moods:", error);
    }
  };

  const handleMoodMarkerPress = (pin: FriendMoodPin) => {
    const isCurrentUser = pin.friend.id === user?.id;

    Alert.alert(
      `${isCurrentUser ? "Your" : pin.friend.name + "'s"} Mood`,
      `Feeling ${pin.mood.mood} at ${pin.location.name}\n\n"${
        pin.mood.description
      }"\n\n${formatDate(pin.mood.date, false)}`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "View Details",
          onPress: () => {
            navigation.navigate("MoodDetail", {
              moodId: pin.mood.id,
              onMoodUpdated: fetchFriendsLocation,
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(243, 180, 196, 0.8)" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mood Map</Text>
        <Text style={styles.subtitle}>
          Discover the emotional landscape around you 💫
        </Text>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onRegionChangeComplete={setMapRegion}
          ref={mapRef}
        >
          {friendMoodPins.map((pin, index) => (
            <Marker
              key={`${pin.friend.id}-${pin.mood.id}`}
              coordinate={{
                latitude: pin.location.latitude,
                longitude: pin.location.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              centerOffset={{ x: 0, y: 0 }}
            >
              <MoodMarker
                pin={pin}
                onPress={() => handleMoodMarkerPress(pin)}
              />
            </Marker>
          ))}
        </MapView>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchFriendsLocation}
          disabled={loading}
        >
          <Ionicons name="refresh" size={24} color="rgba(93, 22, 40, 0.8)" />
        </TouchableOpacity>

        {/* Legend Button */}
        <TouchableOpacity
          style={styles.legendButton}
          onPress={() => {
            Alert.alert(
              "Mood Colors",
              "🟢 Happy\n🔵 Sad\n🟠 Excited\n🔴 Angry\n⚫ Neutral\n🟣 Tired\n🟤 Scared",
              [{ text: "OK" }]
            );
          }}
        >
          <Ionicons
            name="help-circle"
            size={24}
            color="rgba(93, 22, 40, 0.8)"
          />
        </TouchableOpacity>

        {/* Focus on Current User Mood Button */}
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            backgroundColor: "rgba(158, 77, 127, 0.9)",
            borderRadius: 25,
            padding: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
          onPress={focusOnCurrentUserMood}
        >
          <Ionicons name="location" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Users Without Location Section */}
      {friendsWithoutLocation.length > 0 && (
        <View style={styles.bottomSection}>
          <Text style={styles.bottomSectionTitle}>
            Users without mood locations ({friendsWithoutLocation.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsList}
          >
            {friendsWithoutLocation.map((friend) => {
              const isCurrentUser = friend.id === user?.id;
              return (
                <View key={friend.id} style={styles.friendCard}>
                  <View
                    style={[
                      styles.friendAvatar,
                      isCurrentUser && styles.currentUserAvatar,
                    ]}
                  >
                    <Text style={styles.friendInitial}>
                      {friend.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.friendName}>
                    {isCurrentUser ? "You" : friend.name}
                  </Text>
                  <Text style={styles.friendStatus}>No mood location</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Empty State */}
      {friendMoodPins.length === 0 && friendsWithoutLocation.length === 0 && (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require("../../assets/carousel/carousel-1.json")} // Use one of your existing animations
            style={styles.emptyAnimation}
            autoPlay
            loop
          />
          <Text style={styles.emptyTitle}>No moods on the map yet</Text>
          <Text style={styles.emptySubtext}>
            Start sharing your mood with location to see it appear here!
          </Text>
          <TouchableOpacity
            style={styles.createMoodButton}
            onPress={() => navigation.navigate("CreateMood")}
          >
            <Text style={styles.createMoodButtonText}>Create Mood</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Helper function to get mood color
const getMoodColor = (mood: string): string => {
  const moodColors: { [key: string]: string } = {
    Happy: "#4CAF50",
    Sad: "#2196F3",
    Excited: "#FF9800",
    Angry: "#F44336",
    Neutral: "#9E9E9E",
    Tired: "#9C27B0",
    Scared: "#795548",
  };
  return moodColors[mood] || "#9E9E9E";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 20,
  },

  loadingText: {
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "FredokaSemiBold",
    marginTop: 16,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(243, 180, 196, 0.3)",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    textAlign: "center",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    textAlign: "center",
  },

  mapContainer: {
    flex: 1,
    position: "relative",
  },

  map: {
    flex: 1,
  },

  // Custom Mood Marker Styles
  moodMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  currentUserMarker: {
    // Add special styling for current user if needed
  },

  moodMarkerBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  moodAnimation: {
    width: 40,
    height: 40,
  },

  moodMarkerNameContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    maxWidth: 80,
  },

  moodMarkerName: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    textAlign: "center",
  },

  pulseEffect: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
    top: -10,
  },

  refreshButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(243, 180, 196, 0.9)",
    borderRadius: 25,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  legendButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(243, 180, 196, 0.9)",
    borderRadius: 25,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  bottomSection: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(243, 180, 196, 0.3)",
    maxHeight: 120,
  },

  bottomSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 12,
  },

  friendsList: {
    paddingHorizontal: 4,
  },

  friendCard: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 80,
  },

  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(243, 180, 196, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  currentUserAvatar: {
    backgroundColor: "rgba(158, 77, 127, 0.8)",
  },

  friendInitial: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
  },

  friendName: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    textAlign: "center",
    marginBottom: 2,
  },

  friendStatus: {
    fontSize: 10,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    textAlign: "center",
  },

  emptyContainer: {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: [{ translateX: -width * 0.4 }, { translateY: -100 }],
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: width * 0.8,
  },

  emptyAnimation: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtext: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  createMoodButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },

  createMoodButtonText: {
    color: "rgba(93, 22, 40, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "FredokaSemiBold",
  },
});
