import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Link } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useApi } from "@/hooks/useApi";
import { RepositoryGetUserClubsRow } from "@/services/api/Api";

export default function Tab() {
  const colorScheme = useColorScheme();
  const { api } = useApi();
  const [clubs, setClubs] = useState<RepositoryGetUserClubsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchClubs = async () => {
        try {
          setIsLoading(true);
          const response = await api.api.getUserClubs();
          setClubs(response.data || []);
        } catch (error) {
          console.error("Failed to fetch user clubs:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchClubs();
    }, [api]),
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: Colors[colorScheme ?? "light"].text },
          ]}
        >
          My Clubs
        </Text>
        <Link href="/create-club" style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create Club</Text>
        </Link>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : clubs.length === 0 ? (
          <Text
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 18,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No clubs joined. Find one to join!
          </Text>
        ) : (
          clubs.map((club) => (
            <Link
              key={club.club_id}
              href={{ pathname: "/club", params: { id: club.club_id } }}
              style={[
                styles.tile,
                styles.shadow,
                { backgroundColor: Colors[colorScheme ?? "light"].background },
              ]}
            >
              <View style={styles.tileContent}>
                <Text
                  style={{
                    color: Colors[colorScheme ?? "light"].text,
                    fontSize: 20,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {club.name}
                </Text>
                <Text
                  style={{
                    color: Colors[colorScheme ?? "light"].text,
                    fontSize: 14,
                    opacity: 0.7,
                    textAlign: "center",
                    marginTop: 6,
                  }}
                >
                  {club.description}
                </Text>
              </View>
            </Link>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  tile: {
    height: 200,
    width: "90%",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 5,
  },
  tileContent: {
    alignItems: "center",
    padding: 10,
  },
  shadow: {
    shadowColor: "#00000088",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});
