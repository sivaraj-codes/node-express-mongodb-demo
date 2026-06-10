import { MongoClient } from "mongodb";

let client;

export async function connectDB() {
  if (client) return client;

  client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();

  return client;
}

export function getDB(dbName = process.env.DB_NAME) {
  if (!client) {
    throw new Error("Database connection not initialized");
  }

  if (!dbName) throw new Error("Invalid DB");
  return client.db(dbName);
}
