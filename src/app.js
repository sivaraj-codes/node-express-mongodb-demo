import express from "express";
import cors from "cors";
import userRoutes from "./features/users/user.route.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res, next) => {
  res.send("Welcome API Home");
});

//routes
app.use("/users", userRoutes);

//last for error
app.use(errorHandler);

export default app;
