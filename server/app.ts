import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swaggerSchema/swagger_output.json";
import { HealthRouter } from "./routers/health";
import { UserRouter } from "./routers/users";
import { BoatRouter } from "./routers/boats";
import { LogRouter } from "./routers/logs";
import { TaskRouter } from "./routers/tasks";
import { ExpenseRouter } from "./routers/expenses";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("/users", UserRouter);
app.use("/boat", BoatRouter);
app.use("/logs", LogRouter);
app.use("/tasks", TaskRouter);
app.use("/expenses", ExpenseRouter);
app.use("/", HealthRouter);

app.use((err, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    return res.status(err.status || 500).json({
      message: err.message,
      stack: err.stack,
    });
  }
  return next();
});

export { app };
