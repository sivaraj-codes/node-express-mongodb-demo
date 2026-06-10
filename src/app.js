import express from "express";
import cors from "cors";
import userRoutes from "./features/users/user.route.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";
import { HTTP_STATUS } from "./constants/responseConstants.js";
import { AppError } from "./shared/errors/AppError.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res, next) => {
  res.send("Welcome API Home");
});

//routes
app.use("/users", userRoutes);

app.use((req, res, next) => {
  //if routes not matched
  next(new AppError(`Cannot ${req.method} ${req.path}`, HTTP_STATUS.NOT_FOUND));
});

//last for error
app.use(errorHandler);

export default app;
