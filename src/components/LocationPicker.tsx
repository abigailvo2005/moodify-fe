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

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onLocationChanged,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    LocationData | undefined
  >(location);
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.7769, // Default to Ho Chi Minh City
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    setSelectedLocation(location);
  }, [location]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your current location."
        );
        return;
      }

      // Get current position
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
    } catch (error) {
      console.log("Error getting current location:", error);
      Alert.alert("Error", "Failed to get current location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle map press
  const handleMapPress = async (event: MapPressEvent) => {
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
              onPress={() => setShowMapModal(true)}
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
            onPress={getCurrentLocation}
            disabled={disabled || isLoading}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color="rgba(93, 22, 40, 0.7)"
            />
            <Text style={styles.addLocationText}>Add Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectLocationButton}
            onPress={() => setShowMapModal(true)}
            disabled={disabled}
          >
            <Ionicons
              name="map-outline"
              size={20}
              color="rgba(93, 22, 40, 0.7)"
            />
            <Text style={styles.selectLocationText}>Select on Map</Text>
          </TouchableOpacity>
        </View>
      )}

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
    flexDirection: "row",
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
    marginLeft: 8,
  },

  selectLocationButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(243, 180, 196, 0.6)",
  },

  selectLocationText: {
    fontSize: 14,
    color: "rgba(93, 22, 40, 0.7)",
    fontFamily: "Fredoka",
    marginLeft: 8,
  },

  // Map Modal Styles
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
