import { Api } from "@/services/api/Api";
import React, { createContext, useContext, useMemo } from "react";
import { useRouter } from "expo-router";
import { storage } from "@/services/storage";

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
    const api = new Api();

    // auth interceptor: attach token to each request header
    api.instance.interceptors.request.use(async (config) => {
      const token = await storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // unauthorized interceptor:
    // if any request responds with unauthorized, redirect to login page
    // api.instance.interceptors.response.use(
    //   (response) => response,
    //   (error) => {
    //     if (error.response && error.response.status === 401) {
    //       router.replace("/(auth)/login");
    //     }
    //     return Promise.reject(error);
    //   },
    // );

    return api;
  }, [router]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
