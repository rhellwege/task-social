import { Stack } from "expo-router";

export default function MyClubsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[clubId]/posts" options={{ title: "Club Posts" }} />
    </Stack>
  );
}
