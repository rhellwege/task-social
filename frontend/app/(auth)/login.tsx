import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";
import { useState } from "react";
import { Button, TextInput, StyleSheet, View } from "react-native";
import { useApi } from "@/hooks/useApi";
import { HandlersLoginUserRequest } from "@/services/api/Api";
import { toastFetchError, toastSuccess } from "@/services/toast";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { api, login } = useApi();

  const handleLogin = async () => {
    try {
      const user: HandlersLoginUserRequest = {
        email,
        password,
      };
      const resp = await api.api.loginUser(user);
      if (resp.data.token) {
        await login(resp.data.token);
        toastSuccess("Login successful");
        // The redirect is now handled by the root layout observer
      }
    } catch (error) {
      toastFetchError(error);
    }
  };

  return (
    <ThemedView style={styles.container} testID="login-page">
      <ThemedText type="title">Login</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        testID="email-input"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />
      <Button title="Login" onPress={handleLogin} testID="login-button" />
      <View style={styles.linkContainer}>
        <ThemedText>{"Don't have an account? "}</ThemedText>
        <Link href="/(auth)/register" testID="register-link">
          <ThemedText type="link">Register</ThemedText>
        </Link>
      </View>
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
  linkContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
