import { api } from "./client";

export const AuthAPI = {
  register: (payload) => api("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => api("/api/auth/login", { method: "POST", body: payload }),
  me: () => api("/api/auth/me")
};
