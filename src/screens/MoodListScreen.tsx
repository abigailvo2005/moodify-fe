import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { getMoods } from "../services/api";
import { User } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function MoodListScreen() {
  const [moods, setMoods] = useState<any[]>([]);
  const { user } = useAuth();
  

  useEffect(() => {
    // Fetch moods for the user
    const fetchMoods = async () => {
      if (user) {
        const userMoods = await getMoods(user.id);
        setMoods(userMoods);
      }
    }
    fetchMoods();

    console.log("User data:", user);
    console.log("Fetched moods:", moods);
  }, []);

  
  return (
    <View style={{ padding: 20 }}>
      <Text>Mood List</Text>
      <FlatList
        data={moods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>{item.description}</Text>
            <Text>{item.reason}</Text>
          </View>
        )}
      />
    </View>
  );
}
