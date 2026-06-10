import { sendError } from "../utils/handlers.js";

export const errorHandler = (err, req, res, next) => {
  const message = err.message || "Internal Server Error";
  const statusCode = err.statusCode || 500;
  console.error(err);

  sendError({ res, message, statusCode });
};
