import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();

  const handleLogin = async () => {
    try {
      const res = await loginUser(username, password);

      if(!res) {
        Alert.alert('Login failed', 'Incorrect username or password');
        return;
      }

      if (res) {
        setUser(res);
        console.log('Login User:', res);
        navigation.replace('App');
      } else {
        Alert.alert('Login failed', 'Incorrect username or password');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Username</Text>
      <TextInput value={username} onChangeText={setUsername} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 20 }} />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}