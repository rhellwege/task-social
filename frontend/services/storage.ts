import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";

export const storage = {
  getToken: (): Promise<string | null> => {
    console.log("GET TOKEN");
    if (Platform.OS === "web") {
      return Promise.resolve(localStorage.getItem(TOKEN_KEY));
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  setToken: (token: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(TOKEN_KEY, token);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  deleteToken: (): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(TOKEN_KEY);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
