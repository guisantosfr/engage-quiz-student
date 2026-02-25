import "../global.css"
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Toast />
    </SafeAreaProvider>
  );
}