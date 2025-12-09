import { Api, ApiConfig } from "@/services/api/Api";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "expo-router";
import { storage } from "@/services/storage";
import { toastError } from "@/services/toast";
import { API_BASE_URL } from "@/constants/Api";

// Define the shape of the context value
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

  // Initialize token from storage on app load
  useEffect(() => {
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
  }, []);

  const api = useMemo(() => {
    const apiConfig: ApiConfig = {
      baseUrl: API_BASE_URL,
    };
    const apiInstance = new Api(apiConfig);

    // monkey patch fetch to add interceptors
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
      let [resource, config] = args;

      // request interceptor to add the token
      const requestInterceptor = (config: any) => {
        // Use the token from our state
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      };

      const response = await originalFetch(
        resource,
        requestInterceptor(config),
      );

      // response interceptor for 401 errors
      const responseInterceptor = async (response: Response) => {
        if (response.status === 401 && token) {
          await logout();
          toastError("Login expired, please login again");
        }
        return response;
      };

      // Clone the response before passing it to the interceptor, as it can only be consumed once.
      return await responseInterceptor(response.clone());
    };

    return apiInstance;
  }, [token]); // Re-create api instance if token changes

  const login = async (newToken: string) => {
    setToken(newToken);
    await storage.setToken(newToken);
  };

  const logout = async () => {
    setToken(null);
    await storage.deleteToken();
    router.replace("/(auth)/login");
  };

  // Render children only after token is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <ApiContext.Provider value={{ api, token, login, logout }}>
      {children}
    </ApiContext.Provider>
  );
};
