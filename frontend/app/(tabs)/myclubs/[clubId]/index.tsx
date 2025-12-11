import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { RepositoryClub } from "@/services/api/Api";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function ClubDetail() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const colorScheme = useColorScheme();
  const { api } = useApi();
  const [club, setClub] = useState<RepositoryClub | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;

    const fetchClubDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.api.getClub(clubId);
        setClub(response.data);
      } catch (error) {
        console.error("Failed to fetch club details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubDetails();
  }, [api, clubId]);

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
    <>
      <Stack.Screen options={{ title: club.name }} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">{club.name}</ThemedText>
          <ThemedText style={styles.description}>{club.description}</ThemedText>
        </View>
        <Link href="./posts" style={styles.postsButton}>
          <Text style={styles.postsButtonText}>View Posts</Text>
        </Link>
      </ThemedView>
    </>
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
  postsButton: {
    marginTop: 20,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  postsButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
