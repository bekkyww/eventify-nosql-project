import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthAPI } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await AuthAPI.me();
      setUser(data.user);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const data = await AuthAPI.login({ email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
    async register(payload) {
      const data = await AuthAPI.register(payload);
      localStorage.setItem("token", data.token);
      setUser(data.user);
    },
    logout() {
      localStorage.removeItem("token");
      setUser(null);
    }
  }), [user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
