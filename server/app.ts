import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swaggerSchema/swagger_output.json";
import { HealthRouter } from "./routers/health";
import { UserRouter } from "./routers/users";
import { BoatRouter } from "./routers/boats";
import { LogRouter } from "./routers/logs";
import { TaskRouter } from "./routers/tasks";
import { auth } from "./middleware/auth";
import { FriendsRouter } from "./routers/friends";
import { AuthRouter } from "./routers/authCheck";
import { ExpenseRouter } from "./routers/expenses";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("/health", HealthRouter);
app.use("/users", UserRouter);

app.use(auth);

app.use("/boat", BoatRouter);
app.use("/logs", LogRouter);
app.use("/tasks", TaskRouter);
app.use("/friends", FriendsRouter);
app.use("/auth-check", AuthRouter);
app.use("/expenses", ExpenseRouter);

app.use((err, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Application Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err) {
    return res.status(err.status || 500).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  return next();
});

// Add startup logging
console.log('🔧 BoatOwner API Application configured');
console.log('📋 Routes registered:', ['/health', '/users', '/boat', '/logs', '/tasks', '/friends', '/auth-check', '/expenses']);

export { app };

