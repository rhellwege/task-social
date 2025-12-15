import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useApi } from "@/hooks/useApi";
import { RepositoryClub } from "@/services/api/Api";
import { toastError, toastSuccess } from "@/services/toast";
import { Stack } from "expo-router";

export default function Tab() {
  const colorScheme = useColorScheme();
  const { api } = useApi();
  const [clubs, setClubs] = useState<RepositoryClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchPublicClubs = async () => {
        try {
          setIsLoading(true);
          const response = await api.api.getPublicClubs();
          setClubs(response.data || []);
        } catch (error) {
          console.error("Failed to fetch public clubs:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPublicClubs();
    }, [api]),
  );

  const handleJoin = async (clubId: string) => {
    try {
      await api.api.joinClub(clubId);
      toastSuccess("Successfully joined club!");
      // Remove the joined club from the list
      setClubs((prev) => prev.filter((club) => club.id !== clubId));
    } catch (error) {
      console.error("Failed to join club:", error);
      toastError("Failed to join club.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Explore" }} />
      <ScrollView contentContainerStyle={[styles.container, { marginTop: 20 }]}>
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          clubs.map((club) => (
            <View
              key={club.id}
              style={[
                styles.tile,
                styles.shadow,
                { backgroundColor: Colors[colorScheme ?? "light"].background },
              ]}
            >
              <View style={styles.tileContent}>
                <View style={styles.circle}></View>
                <Text
                  style={{
                    color: Colors[colorScheme ?? "light"].text,
                    fontSize: 25,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {club.name}
                </Text>
              </View>
              <Text
                style={{
                  color: Colors[colorScheme ?? "light"].text,
                  fontSize: 18,
                  padding: 10,
                }}
              >
                {club.description}
              </Text>
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  { backgroundColor: Colors[colorScheme ?? "light"].tint },
                ]}
                onPress={() => handleJoin(club.id!)}
              >
                <Text
                  style={[
                    styles.joinButtonText,
                    {
                      color:
                        colorScheme === "dark"
                          ? Colors.dark.background
                          : "white",
                    },
                  ]}
                >
                  Join
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 80,
  },
  tile: {
    height: 250,
    flexDirection: "column",
    width: "90%",
    justifyContent: "space-around",
    marginTop: 20,
    borderRadius: 5,
    padding: 10,
  },
  tileContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 10,
  },
  circle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#888",
  },
  shadow: {
    shadowColor: "#00000088",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  joinButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
  joinButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
