import { View, StyleSheet, Image } from "react-native";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Stack } from "expo-router";
import { ScrollView } from "react-native";
import { RepositoryItem } from "@/services/api/Api";

export default function Tab() {
  const { api } = useApi();
  const [username, setUsername] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [items, setItems] = useState<RepositoryItem[]>([]);
  const formattedDate = new Date(createdDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const request = async () => {
      const resp = await api.api.getUser();
      // if generated client may not include the method, guard it
      setUsername(resp.data.username!);
      setCreatedDate(resp.data.created_at!);
      setProfilePic(resp.data.profile_picture!);
      const itemsResp = await api.api.getItemsByOwner();
      setItems(itemsResp?.data! ?? []);
    };

    request();
  }, [api]);

  return (
    <>
      <ScrollView style={{ height: "100%" }}>
        <Stack.Screen options={{ title: "Profile" }} />
        <ThemedView style={styles.container} testID="profile-screen">
          <ThemedView style={styles.profileView}>
            <Image source={{ uri: profilePic }} style={styles.circle} />
            <View style={styles.name}>
              <ThemedText type="title">User</ThemedText>
              <ThemedText type="subtitle" testID="username">
                @{username}
              </ThemedText>
              <ThemedText>Joined on {formattedDate}</ThemedText>
            </View>
          </ThemedView>
          <View style={styles.itemView}>
            <ThemedText type="default" style={{ fontWeight: "700" }}>
              Your Items
            </ThemedText>
            {items.length === 0 ? (
              <ThemedText style={{ paddingLeft: 20 }}>No items yet</ThemedText>
            ) : (
              items.map((it) => (
                <ThemedText key={it.id ?? it.name ?? JSON.stringify(it)}>
                  {it.name ?? String(it)}
                </ThemedText>
              ))
            )}
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ThemedText type="default">Edit Profile</ThemedText>
            <View style={styles.line} />
            <ThemedText type="default">Account Settings</ThemedText>
            <View style={styles.line} />
            <ThemedText> App Settings </ThemedText>
            <View style={styles.line} />
            <ThemedText type="default">Your Data</ThemedText>
            <View style={styles.line} />
            <ThemedText type="default">Contact Us</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 50,
    paddingVertical: 20,
  },
  profileView: {
    height: 80,
    width: "70%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderRadius: 5,
    gap: 10,
  },
  itemView: {
    width: "80%",
    flexDirection: "column",
    gap: 10,
  },
  circle: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: "#888",
  },
  line: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: 250,
  },
  name: {
    width: "50%",
  },
});
