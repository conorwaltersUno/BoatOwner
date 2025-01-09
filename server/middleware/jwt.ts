import jwt from "jsonwebtoken";
import createError from "http-errors";

function signAccessToken(payload) {
  try {
    return jwt.sign({ payload }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
  } catch (error: any) {
    throw Error(error.message);
  }
}

function signRefreshToken(payload) {
  try {
    return jwt.sign({ payload }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
  } catch (error: any) {
    throw Error(error.message);
  }
}

function verifyRefreshToken(token) {
  try {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
          const message = err.name == "JsonWebTokenError" ? "Unauthorized" : err.message;
          return reject(createError.Unauthorized(message));
        }
        resolve(payload);
      });
    });
  } catch (error: any) {
    throw Error(error.message);
  }
}

function verifyAccessToken(token) {
  try {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
          const message = err.name == "JsonWebTokenError" ? "Unauthorized" : err.message;
          return reject(createError.Unauthorized(message));
        }
        resolve(payload);
      });
    });
  } catch (error: any) {
    throw Error(error.message);
  }
}

const JwtMiddleWare = {
  verifyAccessToken,
  verifyRefreshToken,
  signRefreshToken,
  signAccessToken,
};

export { JwtMiddleWare };
