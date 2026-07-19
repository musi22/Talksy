import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";

dotenv.config();

connectDb();

connectRabbitMQ();

class RedisMock {
  private store = new Map<string, string>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  async connect() {
    console.log("✅ [Mock Redis] Connected to in-memory Redis client");
    return this;
  }

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async set(key: string, value: any, options?: { EX?: number }) {
    this.store.set(key, String(value));
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)!);
      this.timeouts.delete(key);
    }
    if (options?.EX) {
      const timeout = setTimeout(() => {
        this.store.delete(key);
        this.timeouts.delete(key);
      }, options.EX * 1000);
      this.timeouts.set(key, timeout);
    }
    return "OK";
  }

  async del(key: string) {
    const deleted = this.store.delete(key);
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)!);
      this.timeouts.delete(key);
    }
    return deleted ? 1 : 0;
  }
}

const useMock = !process.env.REDIS_URL || 
                process.env.REDIS_URL.includes("localhost") || 
                process.env.REDIS_URL.includes("127.0.0.1") ||
                process.env.REDIS_URL.includes("redis://redis");

export const redisClient = useMock
  ? (new RedisMock() as any)
  : createClient({ url: process.env.REDIS_URL });

redisClient
  .connect()
  .then(() => console.log(useMock ? "Mock Redis connected" : "connected to redis"))
  .catch(console.error);

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
