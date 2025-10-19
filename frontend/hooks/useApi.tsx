import { Api } from "@/services/api/Api";
import React, { createContext, useContext, useMemo } from "react";

const ApiContext = createContext<Api<unknown> | null>(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useMemo(() => {
    const api = new Api();
    // TODO: Add a request interceptor to add the auth token to requests
    return api;
  }, []);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
