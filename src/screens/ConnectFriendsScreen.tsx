import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";

export default function ConnectFriendsScreen() {
  const [referralCode, setReferralCode] = useState("");

  const handleConnect = () => {
    // logic để kết bạn qua mã code
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter referral code to connect</Text>
      <TextInput
        value={referralCode}
        onChangeText={setReferralCode}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Connect" onPress={handleConnect} />
    </View>
  );
}
