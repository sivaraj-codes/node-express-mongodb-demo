import * as userService from "./user.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
