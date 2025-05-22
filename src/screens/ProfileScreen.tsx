import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { User } from "../types";
import { useAuth } from "../contexts/AuthContext";


export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const {user, setUser} = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setName(user.name);
        setUsername(user.username);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = () => {
    // gọi API update user ở đây nếu muốn
    console.log("Updated:", { name, username });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Text>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Update" onPress={handleUpdate} />
    </View>
  );
}
