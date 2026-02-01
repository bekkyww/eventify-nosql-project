import { api } from "./client";

export const TicketsAPI = {
  mine: () => api("/api/tickets/mine"),
  register: (eventId) => api(`/api/tickets/register/${eventId}`, { method: "POST" }),
  cancel: (eventId) => api(`/api/tickets/cancel/${eventId}`, { method: "POST" }),
  checkin: (eventId, userId) => api(`/api/tickets/checkin/${eventId}/${userId}`, { method: "POST" }),
  feedback: (eventId, payload) => api(`/api/tickets/feedback/${eventId}`, { method: "POST", body: payload })
};
