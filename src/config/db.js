import { MongoClient } from "mongodb";

let db;

export const connectDB = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  db = client.db(process.env.DB_NAME);

  console.log("MongoDB Connected");
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database connection not initialized");
  }

  return db;
};
