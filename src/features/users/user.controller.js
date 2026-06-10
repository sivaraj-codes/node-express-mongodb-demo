import { HTTP_STATUS, MESSAGES } from "../../constants/responseConstants.js";
import { sendSuccess } from "../../shared/utils/handlers.js";
import * as userService from "./user.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();

    // res.json(users);
    sendSuccess({
      res,
      data: users,
      statusCode: HTTP_STATUS.OK,
      message: MESSAGES.USER_LIST_FETCHED,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    console.log("REQ", req);
    const user = await userService.createUser(req.body);

    // res.status(201).json(user);

    sendSuccess({
      res,
      data: user,
      statusCode: HTTP_STATUS.CREATED,
      message: MESSAGES.USER_CREATED,
    });
  } catch (error) {
    next(error);
  }
};
