// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import HomeScreen from "../screens/HomeScreen";
// import MoodListScreen from "../screens/MoodListScreen";
// import ConnectFriendsScreen from "../screens/ConnectFriendsScreen";
// import ProfileScreen from "../screens/ProfileScreen";

// const Tab = createBottomTabNavigator();

// export default function BottomTabNavigator() {
//   return (
//     <Tab.Navigator screenOptions={{ headerShown: false }} >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="Moods" component={MoodListScreen} />
//       <Tab.Screen name="Friends" component={ConnectFriendsScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import MoodListScreen from "../screens/MoodListScreen";
import ConnectFriendsScreen from "../screens/ConnectFriendsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Mood") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Friends") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else {
            iconName = "ellipse"; // fallback icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#a33475", // Pink chủ đạo
        tabBarInactiveTintColor: "#a594b5", // Light purple/gray
        tabBarLabelStyle: {
          fontFamily: "FredokaSemiBold",
          fontSize: 12,
          marginTop: 5,
        },
        tabBarStyle: {
          backgroundColor: "#eee1f0",
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          height: 70,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Mood"
        component={MoodListScreen}
        options={{
          tabBarLabel: "Moods",
        }}
      />
      <Tab.Screen
        name="Friends"
        component={ConnectFriendsScreen}
        options={{
          tabBarLabel: "Friends",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}
