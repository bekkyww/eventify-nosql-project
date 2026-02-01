import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import ticketsRoutes from "./routes/tickets.routes.js";
import adminRoutes from "./routes/admin.routes.js";

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/tickets", ticketsRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error"
    });
  });

  return app;
}
