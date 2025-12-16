import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/useApi";
import Ionicons from "@expo/vector-icons/Ionicons";

interface Listing {
  id: string;
  title: string;
  price: string;
  seller: string;
}

export default function ClubDetail() {
  // Supports both param names to stay compatible with your current project
  const params = useLocalSearchParams();
  const clubId = (params.clubId ?? params.id) as string | undefined;

  const colorScheme = useColorScheme();
  const { api } = useApi();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [showPost, setShowPost] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function loadListings() {
    if (!clubId) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.api.getClubItems(clubId);
      const data = res.data;

      if (!res.ok) {
        throw new Error("Failed to load items");
      }

      const mapped: Listing[] = (Array.isArray(data) ? data : []).map(
        (it: any) => ({
          id: String(it.id),
          title: it.name ?? "Untitled",
          price: "—", // current backend items schema has no price field
          seller: it.owner_username || "unknown",
        }),
      );

      setListings(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load items");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  async function postItem() {
    if (!clubId) return;

    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.api.createClubItem(clubId, {
        name: name.trim(),
        description: description.trim() ? description.trim() : undefined,
      });

      if (!res.ok) {
        throw new Error("Failed to post item");
      }

      setShowPost(false);
      setName("");
      setDescription("");
      await loadListings();
    } catch (e: any) {
      setError(e?.message || "Failed to post item");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, api]);

  const renderListing = ({ item }: { item: Listing }) => (
    <View style={styles.listingItem}>
      <Text style={styles.listingTitle}>{item.title}</Text>
      <Text style={styles.listingPrice}>{item.price}</Text>
      <Text style={{ color: "#888", fontSize: 14 }}>by {item.seller}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Club Marketplace",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push(`/myclubs/${clubId}`)}
              style={{ marginLeft: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={styles.container}>
          <Text
            style={{
              color: Colors[colorScheme ?? "light"].text,
              fontSize: 26,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Club Marketplace
          </Text>

          {error ? (
            <Text style={{ color: "#cc4444", marginBottom: 10 }}>{error}</Text>
          ) : null}

          <FlatList
            data={listings}
            renderItem={renderListing}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              !loading ? (
                <Text style={{ color: "#888", fontSize: 16 }}>
                  No items for sale yet!
                </Text>
              ) : null
            }
          />

          <TouchableOpacity
            style={styles.postButton}
            onPress={() => setShowPost(true)}
            disabled={loading}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {loading ? "Working..." : "+ Post Item for Sale"}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={showPost}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPost(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Post Item for Sale</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Item name"
                  value={name}
                  onChangeText={setName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Description (optional)"
                  value={description}
                  onChangeText={setDescription}
                />

                <View style={styles.modalRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnOutline]}
                    onPress={() => setShowPost(false)}
                    disabled={loading}
                  >
                    <Text style={styles.modalBtnOutlineText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={postItem}
                    disabled={loading}
                  >
                    <Text style={styles.modalBtnText}>
                      {loading ? "Posting..." : "Post"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ThemeProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  listingItem: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    width: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postButton: {
    marginTop: 20,
    backgroundColor: "#0066ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  listingTitle: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  listingPrice: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#000",
  },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    color: "#000",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#2f6f4e",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnText: { color: "white", fontWeight: "700" },
  modalBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2f6f4e",
  },
  modalBtnOutlineText: { color: "#2f6f4e", fontWeight: "700" },
});
