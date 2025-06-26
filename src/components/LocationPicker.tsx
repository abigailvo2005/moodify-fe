import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { LocationData } from "../types";

const { width, height } = Dimensions.get("window");

interface LocationPickerProps {
  location?: LocationData;
  onLocationChanged: (location: LocationData | undefined) => void;
  disabled?: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onLocationChanged,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    LocationData | undefined
  >(location);
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.7769, // Default to Ho Chi Minh City
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Search related states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setSelectedLocation(location);
  }, [location]);

  // ← NEW: Check and request location permission
  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      console.log("🔍 Checking location permission...");

      // Check current permission status
      const { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();

      if (currentStatus === "granted") {
        console.log("✅ Location permission already granted");
        return true;
      }

      // Request permission if not granted
      console.log("📍 Requesting location permission...");
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        console.log("✅ Location permission granted");
        return true;
      } else {
        console.log("❌ Location permission denied");
        Alert.alert(
          "Location Permission Required",
          "This feature requires location access to work properly. Please enable location permission in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Location.requestForegroundPermissionsAsync(),
            },
          ]
        );
        return false;
      }
    } catch (error) {
      console.log("❌ Error checking location permission:", error);
      Alert.alert("Error", "Failed to check location permission");
      return false;
    }
  };

  // ← ENHANCED: Get current location with permission check
  const getCurrentLocation = async () => {
    // Check permission first
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) return;

    try {
      setIsLoading(true);
      console.log("📍 Getting current location...");

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationData: LocationData = {
        latitude,
        longitude,
        address: address[0]
          ? `${address[0].street || ""} ${address[0].city || ""} ${
              address[0].country || ""
            }`.trim()
          : "Current Location",
        name: address[0]?.name || "Current Location",
      };

      setSelectedLocation(locationData);
      onLocationChanged(locationData);

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      console.log("✅ Current location retrieved successfully");
    } catch (error) {
      console.log("❌ Error getting current location:", error);
      Alert.alert(
        "Location Error",
        "Failed to get your current location. Please try again or select a location manually."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ← NEW: Search for places using geocoding
  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      console.log("🔍 Searching for places:", query);

      // Use expo-location geocoding for search
      const results = await Location.geocodeAsync(query);

      if (results.length === 0) {
        setSearchResults([]);
        return;
      }

      // Convert results to our format and get addresses
      const searchResults: SearchResult[] = await Promise.all(
        results.slice(0, 5).map(async (result, index) => {
          try {
            // Reverse geocode to get detailed address info
            const addressInfo = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });

            const addressDetails = addressInfo[0];
            const fullAddress = addressDetails
              ? `${addressDetails.street || ""} ${addressDetails.city || ""} ${
                  addressDetails.country || ""
                }`.trim()
              : `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`;

            const name =
              addressDetails?.name ||
              addressDetails?.street ||
              `Location ${index + 1}`;

            return {
              id: `${result.latitude}-${result.longitude}-${index}`,
              name: name,
              address: fullAddress,
              latitude: result.latitude,
              longitude: result.longitude,
            };
          } catch (reverseError) {
            console.log("Error getting address details:", reverseError);
            return {
              id: `${result.latitude}-${result.longitude}-${index}`,
              name: `Location ${index + 1}`,
              address: `${result.latitude.toFixed(
                4
              )}, ${result.longitude.toFixed(4)}`,
              latitude: result.latitude,
              longitude: result.longitude,
            };
          }
        })
      );

      setSearchResults(searchResults);
      console.log(`✅ Found ${searchResults.length} search results`);
    } catch (error) {
      console.log("❌ Search error:", error);
      Alert.alert(
        "Search Error",
        "Failed to search for locations. Please try again."
      );
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ← NEW: Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    const locationData: LocationData = {
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.address,
      name: result.name,
    };

    setSelectedLocation(locationData);
    onLocationChanged(locationData);
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);

    console.log("✅ Search result selected:", result.name);
  };

  // ← ENHANCED: Handle map press with permission check
  const handleMapPress = async (event: MapPressEvent) => {
    // Check permission first
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationData: LocationData = {
        latitude,
        longitude,
        address: address[0]
          ? `${address[0].street || ""} ${address[0].city || ""} ${
              address[0].country || ""
            }`.trim()
          : "Selected Location",
        name: address[0]?.name || "Custom Location",
      };

      setSelectedLocation(locationData);
    } catch (error) {
      console.log("Error reverse geocoding:", error);
      // Still set location even if reverse geocoding fails
      setSelectedLocation({
        latitude,
        longitude,
        address: "Selected Location",
        name: "Custom Location",
      });
    }
  };

  // Confirm location selection
  const confirmLocation = () => {
    onLocationChanged(selectedLocation);
    setShowMapModal(false);
  };

  // Remove location
  const removeLocation = () => {
    Alert.alert(
      "Remove Location",
      "Are you sure you want to remove location from this mood?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSelectedLocation(undefined);
            onLocationChanged(undefined);
          },
        },
      ]
    );
  };

  // ← NEW: Show location options modal
  const showLocationOptions = async () => {
    // Check permission first before showing options
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) return;

    Alert.alert(
      "📍 Add Location",
      "How would you like to add location to this mood?",
      [
        {
          text: "📱 Current Location",
          onPress: getCurrentLocation,
        },
        {
          text: "🔍 Search Address",
          onPress: () => setShowSearchModal(true),
        },
        {
          text: "🗺️ Select on Map",
          onPress: () => setShowMapModal(true),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(93, 22, 40, 0.8)" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedLocation ? (
        // Location Selected View
        <View style={styles.locationSelectedContainer}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color="rgba(93, 22, 40, 0.8)" />
            <View style={styles.locationText}>
              <Text style={styles.locationName}>{selectedLocation.name}</Text>
              <Text style={styles.locationAddress}>
                {selectedLocation.address}
              </Text>
            </View>
          </View>

          <View style={styles.locationActions}>
            <TouchableOpacity
              style={styles.changeLocationButton}
              onPress={showLocationOptions}
              disabled={disabled}
            >
              <Ionicons name="pencil" size={16} color="rgba(93, 22, 40, 0.8)" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeLocationButton}
              onPress={removeLocation}
              disabled={disabled}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // No Location View
        <View style={styles.noLocationContainer}>
          <TouchableOpacity
            style={styles.addLocationButton}
            onPress={showLocationOptions}
            disabled={disabled || isLoading}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color="rgba(93, 22, 40, 0.7)"
            />
            <Text style={styles.addLocationText}>Add Location</Text>
            <Text style={styles.addLocationSubtext}>
              Current location, search, or select on map
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ← NEW: Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.searchModalContainer}>
          {/* Search Header */}
          <View style={styles.searchModalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSearchModal(false)}
            >
              <Ionicons name="close" size={24} color="rgba(93, 22, 40, 0.8)" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Search Location</Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* Search Input */}
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="rgba(93, 22, 40, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a place..."
              placeholderTextColor="rgba(93, 22, 40, 0.4)"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchPlaces(text);
              }}
              autoFocus
            />
            {searchLoading && (
              <ActivityIndicator size="small" color="rgba(93, 22, 40, 0.6)" />
            )}
          </View>

          {/* Search Results */}
          <ScrollView style={styles.searchResultsContainer}>
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultSelect(item)}
                  >
                    <Ionicons
                      name="location"
                      size={20}
                      color="rgba(93, 22, 40, 0.6)"
                    />
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultAddress}>
                        {item.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            ) : searchQuery.length >= 3 && !searchLoading ? (
              <View style={styles.noResultsContainer}>
                <Ionicons
                  name="search"
                  size={40}
                  color="rgba(93, 22, 40, 0.3)"
                />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try searching for a different location
                </Text>
              </View>
            ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
              <View style={styles.searchHintContainer}>
                <Text style={styles.searchHintText}>
                  Type at least 3 characters to search
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          {/* Header */}
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              style={styles.mapModalCloseButton}
              onPress={() => setShowMapModal(false)}
            >
              <Ionicons name="close" size={24} color="rgba(93, 22, 40, 0.8)" />
            </TouchableOpacity>

            <Text style={styles.mapModalTitle}>Select Location</Text>

            <TouchableOpacity
              style={styles.mapModalConfirmButton}
              onPress={confirmLocation}
            >
              <Text style={styles.mapModalConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Map */}
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title={selectedLocation.name}
                description={selectedLocation.address}
              />
            )}
          </MapView>

          {/* Location Info */}
          {selectedLocation && (
            <View style={styles.mapLocationInfo}>
              <Ionicons
                name="location"
                size={20}
                color="rgba(93, 22, 40, 0.8)"
              />
              <View style={styles.mapLocationText}>
                <Text style={styles.mapLocationName}>
                  {selectedLocation.name}
                </Text>
                <Text style={styles.mapLocationAddress}>
                  {selectedLocation.address}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },

  loadingContainer: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
  },

  loadingText: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
    marginTop: 8,
    fontWeight: "500",
  },

  locationSelectedContainer: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
  },

  locationInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  locationText: {
    marginLeft: 12,
    flex: 1,
  },

  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
  },

  locationAddress: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    marginTop: 2,
  },

  locationActions: {
    flexDirection: "row",
    gap: 8,
  },

  changeLocationButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    borderRadius: 12,
    padding: 8,
  },

  removeLocationButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 12,
    padding: 8,
  },

  noLocationContainer: {
    gap: 12,
  },

  addLocationButton: {
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
    borderStyle: "dashed",
  },

  addLocationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "FredokaSemiBold",
    marginTop: 8,
  },

  addLocationSubtext: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    marginTop: 4,
    textAlign: "center",
  },

  // ← NEW: Search Modal Styles
  searchModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(243, 180, 196, 0.3)",
  },

  modalCloseButton: {
    width: 40,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
  },

  headerSpacer: {
    width: 40,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(243, 180, 196, 0.1)",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(243, 180, 196, 0.3)",
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "Fredoka",
    marginLeft: 12,
  },

  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "rgba(243, 180, 196, 0.05)",
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(243, 180, 196, 0.2)",
  },

  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },

  searchResultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
  },

  searchResultAddress: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    marginTop: 2,
  },

  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },

  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.6)",
    fontFamily: "FredokaSemiBold",
    marginTop: 16,
  },

  noResultsSubtext: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.4)",
    fontFamily: "Fredoka",
    marginTop: 8,
    textAlign: "center",
  },

  searchHintContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },

  searchHintText: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    textAlign: "center",
  },

  // Map Modal Styles (existing)
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(243, 180, 196, 0.3)",
  },

  mapModalCloseButton: {
    width: 40,
  },

  mapModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
  },

  mapModalConfirmButton: {
    backgroundColor: "rgba(243, 180, 196, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  mapModalConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.9)",
    fontFamily: "FredokaSemiBold",
  },

  map: {
    flex: 1,
  },

  mapLocationInfo: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(243, 180, 196, 0.3)",
  },

  mapLocationText: {
    marginLeft: 12,
    flex: 1,
  },

  mapLocationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(93, 22, 40, 0.8)",
    fontFamily: "FredokaSemiBold",
  },

  mapLocationAddress: {
    fontSize: 12,
    color: "rgba(93, 22, 40, 0.5)",
    fontFamily: "Fredoka",
    marginTop: 2,
  },
});
