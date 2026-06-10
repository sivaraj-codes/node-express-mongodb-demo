import { HTTP_STATUS } from "../../constants/responseConstants.js";
import { sendError } from "../utils/handlers.js";

export const errorHandler = (err, req, res, next) => {
  const message = err.message || "Internal Server Error";
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  console.error(err);

  sendError({ res, message, statusCode });
};
