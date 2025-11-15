import { Api, ApiConfig } from "@/services/api/Api";
import React, { createContext, useContext, useMemo } from "react";
import { useRouter } from "expo-router";
import { storage } from "@/services/storage";
import { toastError } from "@/services/toast";
import { API_BASE_URL } from "@/constants/Api";

const ApiContext = createContext<Api<unknown> | null>(null);

export const useApi = (): Api<unknown> => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const api = useMemo(() => {
    const apiConfig: ApiConfig = {
      baseUrl: API_BASE_URL,
    };
    const api = new Api(apiConfig);

    // monkey patch fetch to add interceptors
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
      let [resource, config] = args;

      // request interceptor here
      const requestInterceptor = async (config: any) => {
        const token = await storage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      };

      const response = await originalFetch(
        resource,
        await requestInterceptor(config),
      );

      // response interceptor here
      const responseInterceptor = async (response: any) => {
        if (response.status === 401) {
          router.replace("/(auth)/login");
          toastError("Login expired, please login again");
        }
        return response;
      };

      return await responseInterceptor(response);
    };

    return api;
  }, [router]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
