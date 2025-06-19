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
  Platform,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import LottieView from "lottie-react-native";
import { useAuth } from "../contexts/AuthContext";
import { getMoods, getUsersByIds } from "../services/apiSwitch";
import { Mood, User, LocationData } from "../types";
import { MOOD_ICONS } from "../constants";
import { formatDate } from "../utils/formatDate";
import { useFocusEffect } from "expo-router";
import { MoodMarker } from "../components/MoodMarker";
import { FriendMoodPin } from "../types";

const { width, height } = Dimensions.get("window");

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

  // Auto focus on current user's mood after data is loaded
  const autoFocusOnCurrentUserMood = () => {
    const currentUserPin = friendMoodPins.find(
      (pin) => pin.friend.id === user?.id
    );
    if (currentUserPin && mapRef.current) {
      console.log("🎯 Auto focusing on current user's mood");
      mapRef.current.animateToRegion(
        {
          latitude: currentUserPin.location.latitude,
          longitude: currentUserPin.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000 // duration in ms
      );
    }
  };

  // Helper to focus map on current user's latest mood (manual)
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

      // ← FIXED: Auto focus on current user's mood after loading data
      // Use setTimeout to ensure state is updated before focusing
      setTimeout(() => {
        autoFocusOnCurrentUserMood();
      }, 500);
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

        const pinsData = [
          {
            friend: currentUser,
            mood: latestMood,
            location: latestMood.location!,
          },
        ];

        setFriendMoodPins(pinsData);

        // ← FIXED: Auto focus on current user's mood
        setTimeout(() => {
          autoFocusOnCurrentUserMood();
        }, 500);
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

  // ← FIXED: Check if current user has mood with location
  const currentUserHasMoodLocation = friendMoodPins.some(
    (pin) => pin.friend.id === user?.id
  );

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
          showsMyLocationButton={false}
          onRegionChangeComplete={setMapRegion}
          ref={mapRef}
        >
          {friendMoodPins.map((pin, index) =>
            Platform.OS !== "ios" ? (
              <Marker
                key={`${pin.friend.id}-${pin.mood.id}`}
                coordinate={{
                  latitude: pin.location.latitude,
                  longitude: pin.location.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                centerOffset={{ x: 0, y: 0 }}
                pinColor={getMoodColor(pin.mood.mood)}
                title={pin.friend.name}
                description={`${pin.mood.description}`}
                onPress={() => handleMoodMarkerPress(pin)}
              />
            ) : (
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
            )
          )}
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

        {/* ← FIXED: Only show focus button if current user has mood location */}
        {currentUserHasMoodLocation && (
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
        )}
      </View>

      {/* Users Without Location Section */}
      {friendsWithoutLocation.length > 0 && (
        <View style={styles.bottomSection}>
          <Text style={styles.bottomSectionTitle}>
            Friends without mood location ({friendsWithoutLocation.length})
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
                </View>
              );
            })}
          </ScrollView>
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
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 12,
  },

  friendsList: {
    paddingHorizontal: 0,
  },

  friendCard: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 80,
  },

  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "rgba(243, 180, 196, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  currentUserAvatar: {
    backgroundColor: "rgba(158, 77, 127, 0.8)",
  },

  friendInitial: {
    fontSize: 18,
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
});
