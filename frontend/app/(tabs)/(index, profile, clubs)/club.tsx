import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { RepositoryClub } from "@/services/api/Api";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function ClubDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const { api } = useApi();
  const [club, setClub] = useState<RepositoryClub | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchClubDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.api.getClub(id);
        setClub(response.data);
      } catch (error) {
        console.error("Failed to fetch club details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubDetails();
  }, [api, id]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!club) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Club not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">{club.name}</ThemedText>
        <ThemedText style={styles.description}>{club.description}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  description: {
    marginTop: 10,
    textAlign: "center",
    color: "#888",
  },
});
