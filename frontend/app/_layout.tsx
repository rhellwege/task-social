import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ApiProvider, useApi } from "@/hooks/useApi";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { WebSocketProvider } from "@/hooks/useWebSocket";

const InitialLayout = () => {
  const { token } = useApi(); // Changed from useAuth to useApi
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    // If the token is null and the user is not in the auth group, redirect to login.
    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
    // If the token is present and the user is in the auth group, redirect to the main app.
    else if (token && inAuthGroup) {
      router.replace("/explore");
    }
  }, [token, segments, router]);

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
    // The ApiProvider now manages auth state
    <ApiProvider>
      {/* WebSocketProvider is inside ApiProvider to access the auth token */}
      <WebSocketProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <InitialLayout />
          <StatusBar style="auto" />
          <Toast />
        </ThemeProvider>
      </WebSocketProvider>
    </ApiProvider>
  );
}
