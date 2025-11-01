import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useColorScheme } from "@/hooks/useColorScheme";
import { ApiProvider } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { storage } from "@/services/storage";

const InitialLayout = () => {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    if (!navigationState?.key || tokenChecked) return;

    const checkToken = async () => {
      const token = await storage.getToken();
      if (!token) {
        console.log("No token found, redirecting to login");
        router.replace("/(auth)/login");
      } else {
        router.replace("/(tabs)");
      }
      setTokenChecked(true);
    };

    checkToken();
  }, [navigationState?.key, tokenChecked]);

  if (!navigationState?.key) {
    return null;
  }

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
      </ThemeProvider>
    </ApiProvider>
  );
}
