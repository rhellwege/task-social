import { Api, ApiConfig } from "@/services/api/Api";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "expo-router";
import { storage } from "@/services/storage";
import { toastError } from "@/services/toast";
import { API_BASE_URL } from "@/constants/Api";

interface ApiContextType {
  api: Api<unknown>;
  token: string | null;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create a ref to hold the current token. This avoids stale closures.
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const logout = useCallback(async () => {
    setToken(null);
    await storage.deleteToken();
    router.replace("/(auth)/login");
  }, [router]);

  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    // On mount, load token from storage
    const loadToken = async () => {
      try {
        const storedToken = await storage.getToken();
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error("Failed to load token from storage", e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadToken();

    // On mount, patch window.fetch
    const { fetch: originalFetch } = window;
    window.fetch = async (...args) => {
      let [resource, config] = args;

      // Ensure config and headers objects exist
      if (!config) config = {};
      if (!config.headers) config.headers = {};

      // Use the ref to get the *current* token, avoiding stale values
      const currentToken = tokenRef.current;
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }

      const response = await originalFetch(resource, config);
      const responseClone = response.clone();

      if (response.status === 401 && tokenRef.current) {
        await logoutRef.current();
        toastError("Login expired, please login again");
      }

      return responseClone;
    };

    // On unmount, restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [logout]);

  const api = useMemo(() => {
    const apiConfig: ApiConfig = {
      baseUrl: API_BASE_URL,
    };
    return new Api(apiConfig);
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    await storage.setToken(newToken);
  };

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <ApiContext.Provider value={{ api, token, login, logout }}>
      {children}
    </ApiContext.Provider>
  );
};
