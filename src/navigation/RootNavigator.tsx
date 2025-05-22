// RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigation from './AuthNavigator';
import AppNavigation from './AppNavigation';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigation} />
      <Stack.Screen name="App" component={AppNavigation} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
