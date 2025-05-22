import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROUTES } from "../constants";
import { StorageService } from "../services/storageService";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.replace("Auth");
  };

  useEffect(() => {
    console.log("User data:", user);
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>How are you feeling today?</Text>
      <Button
        title="New Mood"
        onPress={() => navigation.navigate(ROUTES.CREATE_MOOD)}
      />
      <Button
        title="Mood List"
        onPress={() => navigation.navigate(ROUTES.MOODS)}
      />
      <Button
        title="Connect Friend"
        onPress={() => navigation.navigate(ROUTES.CONNECT_FRIENDS)}
      />
      <Button
        title="Profile"
        onPress={() => navigation.navigate(ROUTES.PROFILE)}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
