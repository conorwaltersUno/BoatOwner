import { JwtMiddleWare } from "./jwt";
import createError from "http-errors";

const auth = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next(createError.Unauthorized("Access token is required "));
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return next(createError.Unauthorized("Access token is invalid"));
  }

  await JwtMiddleWare.verifyAccessToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((e) => {
      next(createError.Unauthorized(e.message));
    });
};

export { auth };
