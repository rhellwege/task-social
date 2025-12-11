import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Switch,
} from "react-native";
import { useApi } from "@/hooks/useApi";
import { Stack, useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { toastError, toastSuccess } from "@/services/toast";
import { ServicesCreateClubRequest } from "@/services/api/Api";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function CreateClubScreen() {
  const { api } = useApi();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colorScheme = useColorScheme();

  const handleCreateClub = async () => {
    if (name.trim() === "") {
      toastError("Club name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const clubData: ServicesCreateClubRequest = {
        name,
        description,
        is_public: isPublic,
      };

      const response = await api.api.createClub(clubData);

      if (response.data.id) {
        toastSuccess("Club created successfully!");
        // Go back to the previous screen (the clubs list), which will then refetch.
        router.back();
      } else {
        toastError("Failed to create club: No ID returned.");
      }
    } catch (error) {
      console.error("Failed to create club:", error);
      toastError("An error occurred while creating the club.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    color: Colors[colorScheme ?? "light"].text,
    borderColor: Colors[colorScheme ?? "light"].icon,
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create Club" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Create a New Club</ThemedText>

        <TextInput
          style={[styles.input, inputStyle]}
          placeholder="Club Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={Colors[colorScheme ?? "light"].icon}
        />

        <TextInput
          style={[styles.input, styles.textArea, inputStyle]}
          placeholder="Club Description"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor={Colors[colorScheme ?? "light"].icon}
        />

        <View style={styles.switchContainer}>
          <ThemedText>Make Club Public?</ThemedText>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isPublic ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={setIsPublic}
            value={isPublic}
          />
        </View>

        <Button
          title={isSubmitting ? "Creating..." : "Create Club"}
          onPress={handleCreateClub}
          disabled={isSubmitting}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
});
