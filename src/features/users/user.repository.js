import { getDB } from "../../config/db.js";
import { DB_COLLECTIONS } from "../../constants/dbCollections.js";

export const findAll = async () => {
  const db = getDB();
  return db.collection(DB_COLLECTIONS.USERS).find({}).toArray();
};

export const findByEmail = async (email) => {
  const db = getDB();

  return db.collection(DB_COLLECTIONS.USERS).findOne({
    email,
  });
};

export const create = async (userData) => {
  const db = getDB();
  const result = await db.collection(DB_COLLECTIONS.USERS).insertOne(userData);

  return { _id: result.insertedId, ...userData };
};
