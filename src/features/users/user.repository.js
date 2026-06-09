import { getDB } from "../../config/db.js";

export const findAll = () => {
  const db = getDB();
  return db.collection("users").find({}).toArray();
};

export const findByEmail = async (email) => {
  const db = getDB();

  return db.collection("users").findOne({
    email,
  });
};

export const create = async (userData) => {
  const db = getDB();
  const result = await db.collection("users").insertOne(userData);

  return { _id: result.insertedId, ...userData };
};
