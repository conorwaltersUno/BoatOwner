import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { HealthRouter, UserRouter } from "./routers";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swaggerSchema/swagger_output.json";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("/", HealthRouter);
app.use("/users", UserRouter);

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
