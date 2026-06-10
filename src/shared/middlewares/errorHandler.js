import { HTTP_STATUS } from "../../constants/responseConstants.js";
import { sendError } from "../utils/handlers.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";
  console.error(err);

  sendError({ res, statusCode, message });
};
