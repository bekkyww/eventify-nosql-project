import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";

const PORT = process.env.PORT || 4000;

await connectDb(process.env.MONGODB_URI);

const app = createApp();

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
import feedbackRoutes from "./routes/feedback.routes.js";
app.use("/api", feedbackRoutes);
