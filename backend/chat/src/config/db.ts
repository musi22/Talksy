import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer | null = null;

const connectDb = async () => {
  let url = process.env.MONGO_URI;

  if (!url) {
    throw new Error("MONGO_URI is not defined in enviroment variables");
  }

  if (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("mongodb://admin:pass@mongodb")) {
    try {
      console.log("Starting local in-memory MongoDB server for chat service...");
      mongod = await MongoMemoryServer.create();
      url = mongod.getUri();
      console.log(`✅ Chat service in-memory MongoDB started at: ${url}`);
    } catch (err) {
      console.error("Failed to start in-memory MongoDB, will attempt original connection:", err);
    }
  }

  try {
    await mongoose.connect(url, {
      dbName: "Chatappmicroserviceapp",
    });
    console.log("Connected to mongodb");
  } catch (error) {
    console.error("Failed to connect to Mongodb", error);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  if (mongod) await mongod.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  if (mongod) await mongod.stop();
  process.exit(0);
});

export default connectDb;
