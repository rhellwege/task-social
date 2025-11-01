import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useColorScheme } from "@/hooks/useColorScheme";
import { ApiProvider } from "@/hooks/useApi";
import { useEffect } from "react";
import { storage } from "@/services/storage";

import Toast from "react-native-toast-message";

const InitialLayout = () => {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await storage.getToken();
      if (!token) {
        console.log("No token found, redirecting to register");
        router.replace("/(auth)/register");
      } else {
        console.log("Using token found in storage");
        router.replace("/(tabs)");
      }
    };

    checkToken();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <ApiProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </ApiProvider>
  );
}
