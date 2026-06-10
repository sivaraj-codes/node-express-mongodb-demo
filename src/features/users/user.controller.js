import { sendSuccess } from "../../shared/utils/handlers.js";
import * as userService from "./user.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();

    // res.json(users);
    sendSuccess({
      res,
      statusCode: 200,
      data: users,
      message: "users list fetched succesfully",
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    // res.status(201).json(user);

    sendSuccess({
      res,
      statusCode: 201,
      data: user,
      message: "user added succesfully",
    });
  } catch (error) {
    next(error);
  }
};
