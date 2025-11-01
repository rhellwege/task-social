import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useApi } from "@/hooks/useApi";
import {
  HandlersErrorResponse,
  HandlersRegisterUserRequest,
} from "@/services/api/Api";
import { storage } from "@/services/storage";
import { toastFetchError, toastSuccess } from "@/services/toast";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Button, TextInput, StyleSheet } from "react-native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const api = useApi();
  const router = useRouter();

  const handleRegister = async () => {
    const params: HandlersRegisterUserRequest = {
      email,
      password,
      username,
    };

    try {
      const resp = await api.api.registerUser(params);
      router.replace("/(tabs)");
      console.log("Storing new token");
      storage.setToken(resp.data.token!);
      toastSuccess("Registration successful");
      const version = await api.api.version();
      console.log(version.data);
    } catch (error) {
      toastFetchError(error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Register</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="words"
      />
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
      <Button title="Register" onPress={handleRegister} />
      <Link href="/(auth)/login" style={styles.link}>
        <ThemedText type="link">Already have an account? Login</ThemedText>
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
