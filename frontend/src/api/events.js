import { api } from "./client";

export const EventsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/events${q ? `?${q}` : ""}`);
  },
  get: (id) => api(`/api/events/${id}`),
  create: (payload) => api("/api/events", { method: "POST", body: payload }),
  patch: (id, payload) => api(`/api/events/${id}`, { method: "PATCH", body: payload }),
  publish: (id) => api(`/api/events/${id}/publish`, { method: "POST" }),
  getFeedback: (id) => api(`/api/events/${id}/feedback`),
  close: (id) => api(`/api/events/${id}/close`, { method: "POST" }),
  delete: (id) =>
    api(`/api/events/${id}`, {
      method: "DELETE",
    }),
  stats: (id) => api(`/api/events/${id}/stats`)
};
