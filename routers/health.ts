import Router from "express";
import health from "../controllers/health";

const HealthRouter = Router();

HealthRouter.route("/").get(health);

export { HealthRouter };
