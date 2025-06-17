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
import MapView, { Marker, Callout } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAuth } from "../contexts/AuthContext";
import { getMoods, getUsersByIds } from "../services/apiSwitch";
import { Mood, User, LocationData } from "../types";
import { formatDate } from "../utils/formatDate";

const { width, height } = Dimensions.get("window");

interface FriendMoodPin {
  friend: User;
  mood: Mood;
  location: LocationData;
}

export default function MapScreen({ navigation }: any) {
  const [friendMoodPins, setFriendMoodPins] = useState<FriendMoodPin[]>([]);
  const [friendsWithoutLocation, setFriendsWithoutLocation] = useState<User[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.7769, // Default to Ho Chi Minh City
    longitude: 106.7009,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchFriendsLocation();
    getCurrentLocation();
  }, [user]);

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
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  const fetchFriendsLocation = async () => {
    try {
      setLoading(true);

      if (!user?.friends || user.friends.length === 0) {
        setLoading(false);
        return;
      }

      // Get all friends data
      const friends = await getUsersByIds(user.friends);

      // Get all friends' moods
      const friendMoodsPromises = friends.map(async (friend) => {
        const moods = await getMoods(friend.id || "");
        return { friend, moods };
      });

      const friendMoodsData = await Promise.all(friendMoodsPromises);

      const pinsData: FriendMoodPin[] = [];
      const friendsWithoutLocationData: User[] = [];

      friendMoodsData.forEach(({ friend, moods }) => {
        // Filter for public moods with location
        const publicMoodsWithLocation = moods.filter(
          (mood: Mood) => !mood.isPrivate && mood.hasLocation && mood.location
        );

        if (publicMoodsWithLocation.length > 0) {
          // Get the latest mood with location
          const latestMood = publicMoodsWithLocation.sort(
            (a: Mood, b: Mood) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

          pinsData.push({
            friend,
            mood: latestMood,
            location: latestMood.location!,
          });
        } else {
          // Friend has no public moods with location
          friendsWithoutLocationData.push(friend);
        }
      });

      setFriendMoodPins(pinsData);
      setFriendsWithoutLocation(friendsWithoutLocationData);
    } catch (error) {
      console.log("Error fetching friends location:", error);
      Alert.alert("Error", "Failed to load friends' locations");
    } finally {
      setLoading(false);
    }
  };

  const handlePinPress = (pin: FriendMoodPin) => {
    Alert.alert(
      `${pin.friend.name}'s Mood`,
      `Feeling ${pin.mood.mood} at ${pin.location.name}\n\n"${pin.mood.description}"`,
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(243, 180, 196, 0.8)" />
        <Text style={styles.loadingText}>Loading friends' moods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends Map</Text>
        <Text style={styles.subtitle}>
          See where your friends are feeling 💫
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
        >
          {friendMoodPins.map((pin, index) => (
            <Marker
              key={`${pin.friend.id}-${pin.mood.id}`}
              coordinate={{
                latitude: pin.location.latitude,
                longitude: pin.location.longitude,
              }}
              pinColor={getMoodColor(pin.mood.mood)}
              onPress={() => handlePinPress(pin)}
            >
              <View
                style={[
                  styles.customPin,
                  { backgroundColor: getMoodColor(pin.mood.mood) },
                ]}
              >
                <Text style={styles.pinMoodText}>
                  {pin.mood.mood.charAt(0)}
                </Text>
              </View>
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutName}>{pin.friend.name}</Text>
                  <Text style={styles.calloutMood}>
                    Feeling {pin.mood.mood}
                  </Text>
                  <Text style={styles.calloutLocation}>
                    {pin.location.name}
                  </Text>
                  <Text style={styles.calloutDate}>
                    {formatDate(pin.mood.date, true)}
                  </Text>
                </View>
              </Callout>
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
      </View>

      {/* Friends Without Location Section */}
      {friendsWithoutLocation.length > 0 && (
        <View style={styles.bottomSection}>
          <Text style={styles.bottomSectionTitle}>
            Friends without shared location ({friendsWithoutLocation.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsList}
          >
            {friendsWithoutLocation.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendInitial}>
                    {friend.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendStatus}>No location shared</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Empty State */}
      {friendMoodPins.length === 0 && friendsWithoutLocation.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="map-outline"
            size={80}
            color="rgba(93, 22, 40, 0.3)"
          />
          <Text style={styles.emptyTitle}>No friends on the map yet</Text>
          <Text style={styles.emptySubtext}>
            When your friends share their moods with location, they'll appear
            here!
          </Text>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Mood Colors</Text>
        <View style={styles.legendItems}>
          {Object.entries({
            Happy: "#4CAF50",
            Sad: "#2196F3",
            Excited: "#FF9800",
            Angry: "#F44336",
            Neutral: "#9E9E9E",
            Tired: "#9C27B0",
            Scared: "#795548",
          }).map(([mood, color]) => (
            <View key={mood} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{mood}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

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

  customPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
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

  pinMoodText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "FredokaSemiBold",
  },

  calloutContainer: {
    minWidth: 150,
    padding: 8,
  },

  calloutName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 4,
  },

  calloutMood: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "Fredoka",
    marginBottom: 2,
  },

  calloutLocation: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "Fredoka",
    marginBottom: 2,
  },

  calloutDate: {
    fontSize: 11,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
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
    top: "50%",
    left: "50%",
    transform: [{ translateX: -width * 0.4 }, { translateY: -100 }],
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "FredokaSemiBold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtext: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    textAlign: "center",
    lineHeight: 20,
  },

  legend: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  legendTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginBottom: 8,
  },

  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  legendText: {
    fontSize: 10,
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "Fredoka",
  },
});
