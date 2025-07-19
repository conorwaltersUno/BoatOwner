import { JwtMiddleWare } from "./jwt";
import createError from "http-errors";
import rateLimit from "express-rate-limit";

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
      //refresh token?
      next(createError.Unauthorized(e.message));
    });
};

// Rate limiting for user search endpoint
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many search requests, please try again later."
});

// Username format validation (example: alphanumeric, 3-20 chars)
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export { auth };
