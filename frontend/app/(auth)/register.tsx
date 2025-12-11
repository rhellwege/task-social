import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useApi } from "@/hooks/useApi";
import { HandlersRegisterUserRequest } from "@/services/api/Api";
import { toastFetchError, toastSuccess } from "@/services/toast";
import { Link } from "expo-router";
import { useState } from "react";
import { Button, TextInput, StyleSheet, View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { api, login } = useApi();
  const colorScheme = useColorScheme();

  const handleRegister = async () => {
    const params: HandlersRegisterUserRequest = {
      email,
      password,
      username,
    };

    try {
      const resp = await api.api.registerUser(params);
      if (resp.data.token) {
        await login(resp.data.token);
        toastSuccess("Registration successful");
        // The redirect is now handled by the root layout observer
      }
    } catch (error) {
      toastFetchError(error);
    }
  };

  const inputStyle = {
    color: Colors[colorScheme ?? "light"].text,
    borderColor: Colors[colorScheme ?? "light"].icon,
  };

  return (
    <ThemedView style={styles.container} testID="register-page">
      <ThemedText type="title">Register</ThemedText>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        testID="username-input"
        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
      />
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        testID="email-input"
        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
      />
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
      />
      <Button
        title="Register"
        onPress={handleRegister}
        testID="register-button"
      />
      <View style={styles.linkContainer}>
        <ThemedText>Already have an account? </ThemedText>
        <Link href="/(auth)/login" testID="login-link">
          <ThemedText type="link">Login</ThemedText>
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
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
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
