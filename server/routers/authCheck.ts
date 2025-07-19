import Router from "express";
import health from "../controllers/health";

const AuthRouter = Router();

AuthRouter.route("/").get((req, res) => {
  return res.sendStatus(200);
});

export { AuthRouter };
