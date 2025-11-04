import { View, StyleSheet, Image } from "react-native";
import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function Tab() {
  const api = useApi();
  const [username, setUsername] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const formattedDate = new Date(createdDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const request = async () => {
      const resp = await api.api.getUser();
      setUsername(resp.data.username!);
      setCreatedDate(resp.data.created_at!);
      setProfilePic(resp.data.profile_picture!);
    };

    request();
  }, [api]);

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
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
