import { HTTP_STATUS, MESSAGES } from "../../constants/responseConstants.js";
import { AppError } from "../../shared/errors/AppError.js";
import * as userRepository from "./user.repository.js";

export const getUsers = async () => {
  return userRepository.findAll();
};

export const createUser = async (userData) => {
  if (!userData.name) {
    throw new AppError("Name is required", HTTP_STATUS.BAD_REQUEST);
  }

  const existingUser = await userRepository.findByEmail(userData.email);

  if (existingUser) {
    throw new AppError(MESSAGES.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
  }

  return userRepository.create(userData);
};
