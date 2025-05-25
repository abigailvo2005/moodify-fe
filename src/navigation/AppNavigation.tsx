import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import BottomTabNavigator from "./BottomTabNavigator";
import CreateMoodScreen from "../screens/CreateMoodScreen";
import { useAuth } from "../contexts/AuthContext";
import DetailMoodScreen from "../screens/DetailMoodScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkLogin = async () => {
      setIsLoggedIn(!!user);
    };
    checkLogin();
  }, []);

  if (!isLoggedIn) return <AuthNavigator />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen name="CreateMood" component={CreateMoodScreen} />
      <Stack.Screen name="MoodDetail" component={DetailMoodScreen} />
    </Stack.Navigator>
  );
}
