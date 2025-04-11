import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import seatRoutes from "./routes/seats";
import { pool } from "./models/db";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/seats", seatRoutes);

// Test DB connection
pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err: any) => console.error("❌ DB connection error", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
