import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Button, TextInput, StyleSheet } from "react-native";
import { useApi } from "@/hooks/useApi";
import { HandlersLoginUserRequest } from "@/services/api/Api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const api = useApi();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const user: HandlersLoginUserRequest = {
        email,
        password,
      };
      await api.api.loginUser(user);
      router.replace("/(tabs)");
    } catch (error) {
      console.error(error);
      // Handle login error (e.g., show an alert)
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Login</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Link href="/(auth)/register" style={styles.link}>
        <ThemedText type="link">{"Don't have an account? Register"}</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: "white",
  },
  link: {
    marginTop: 16,
    textAlign: "center",
  },
});
