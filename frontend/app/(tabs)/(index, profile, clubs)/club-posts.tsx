import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useApi } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ClubPost } from "@/services/api/Api";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { toastError } from "@/services/toast";

// --- For Isolated Development ---
// This would normally be passed in as a prop or from route params.
const HARDCODED_CLUB_ID = "c5e378c8-0d3a-4b35-a744-938e3e4d7293"; // Replace with a valid club ID from your DB

export default function ClubPostsPage() {
  const { api } = useApi();
  const { on, off, status } = useWebSocket();
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Effect for initial fetch of posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await api.api.getClubPosts(HARDCODED_CLUB_ID);
        setPosts(response.data || []);
      } catch (error) {
        toastError("Failed to fetch club posts.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [api]);

  // Effect for subscribing to new posts via WebSocket
  useEffect(() => {
    const handleNewPost = (post: ClubPost) => {
      // Add the new post to the top of the list
      // We also check if the post belongs to the current club
      if (post.club_id === HARDCODED_CLUB_ID) {
        setPosts((currentPosts) => [post, ...currentPosts]);
      }
    };

    on("new_post", handleNewPost);

    return () => {
      off("new_post", handleNewPost);
    };
  }, [on, off]);

  const handleCreatePost = async () => {
    if (newPostContent.trim() === "") return;

    try {
      await api.api.createClubPost(HARDCODED_CLUB_ID, {
        text_content: newPostContent,
      });
      setNewPostContent("");
      // No need to manually add the post to the state.
      // The WebSocket broadcast will handle it.
    } catch (error) {
      toastError("Failed to create post.");
      console.error(error);
    }
  };

  const renderItem = ({ item }: { item: ClubPost }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postUser}>{item.user_id}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <Text style={styles.postDate}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Club Posts</ThemedText>
      <ThemedText>WebSocket Status: {status}</ThemedText>

      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        <Button title="Post" onPress={handleCreatePost} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
    </ThemedView>
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
