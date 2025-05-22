import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import uuid from 'react-native-uuid';
import { checkReferralCode, registerUser } from "../services/api";
import { User } from "../types";
import { formatDate } from "../utils/formatDate";


export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const formattedDob = formatDate(dob); 

      // Generate a unique referral code
      let referralCode = "";
      let isExist = false;
      do {
        referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        isExist = await checkReferralCode(referralCode);
        console.log("Generated referral code:", referralCode);
      } while (isExist);
      // Check if the referral code already exists

      const newUser:User = {
        id: uuid.v4(),
        name,
        username,
        password,
        dob: formattedDob,
        referralCode: referralCode,
        friends: [],
        token: "", // Optional, for JWT 
      }

      await registerUser(newUser);
      Alert.alert("Success", "Account created");
      navigation.goBack();
    } catch (err) {
      console.error(err);
    }
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

      <Text>Date of Birth</Text>
      <Text
        onPress={() => setShowDatePicker(true)}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      >
        {dob.toDateString()}
      </Text>
      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDob(selectedDate);
          }}
          maximumDate={new Date()} // Không cho chọn tương lai
        />
      )}

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20 }}
      />

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
