import { AppError } from "../../shared/errors/AppError.js";
import * as userRepository from "./user.repository.js";

export const getUsers = async () => {
  return userRepository.findAll();
};

export const createUser = async (userData) => {
  if (!userData.name) {
    throw new AppError("Name is required", 400);
  }

  const existingUser = await userRepository.findByEmail(userData.email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  return userRepository.create(userData);
};
