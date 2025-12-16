import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useApi } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import { RepositoryGetClubPostsRow } from "@/services/api/Api";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { toastError } from "@/services/toast";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ClubPostsPage() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const { api } = useApi();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { on, off, status } = useWebSocket();
  const [posts, setPosts] = useState<RepositoryGetClubPostsRow[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList<RepositoryGetClubPostsRow>>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  // Effect for initial fetch of posts
  useEffect(() => {
    if (typeof clubId !== "string" || clubId.length === 0) return;
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await api.api.getClubPosts(clubId);
        setPosts(response.data || []);
        setShouldScroll(true);
      } catch (error) {
        toastError("Failed to fetch club posts.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [api, clubId]);

  // Effect for subscribing to new posts via WebSocket
  useEffect(() => {
    if (typeof clubId !== "string" || clubId.length === 0) return;
    const handleNewPost = (post: RepositoryGetClubPostsRow) => {
      if (post.club_id === clubId) {
        // Append new posts to the end for chronological order
        setPosts((currentPosts) => [...currentPosts, post]);
        setShouldScroll(true);
      }
    };

    on("new_post", handleNewPost);

    return () => {
      off("new_post", handleNewPost);
    };
  }, [on, off, clubId]);

  const handleCreatePost = async () => {
    if (
      newPostContent.trim() === "" ||
      typeof clubId !== "string" ||
      clubId.length === 0
    )
      return;

    try {
      await api.api.createClubPost(clubId, {
        text_content: newPostContent,
      });
      setNewPostContent("");
    } catch (error) {
      toastError("Failed to create post.");
      console.error(error);
    }
  };

  const renderItem = ({ item }: { item: RepositoryGetClubPostsRow }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postUser}>{item.author_username}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.postDate}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Club Posts",
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
      <ThemedView style={styles.container}>
        <View style={styles.createPostContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: Colors[colorScheme ?? "light"].text,
                borderColor: Colors[colorScheme ?? "light"].icon,
              },
            ]}
            placeholder="What's on your mind?"
            value={newPostContent}
            onChangeText={setNewPostContent}
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
          />
          <Button title="Post" onPress={handleCreatePost} />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            onContentSizeChange={() => {
              if (shouldScroll) {
                setTimeout(
                  () => flatListRef.current?.scrollToEnd({ animated: true }),
                  100,
                );
                setShouldScroll(false);
              }
            }}
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  createPostContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 8,
    color: "white",
  },
  list: {
    marginTop: 16,
  },
  postContainer: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  postUser: {
    fontWeight: "bold",
    color: "#eee",
  },
  postContent: {
    marginTop: 4,
    color: "#fff",
  },
  postDate: {
    marginTop: 8,
    fontSize: 10,
    color: "#aaa",
  },
});
