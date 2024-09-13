import { Request, Response } from "express";
import { UserService } from "../services";
import bcrypt from "bcrypt";
import { UserDTO } from "../interfaces/user";
import { JwtMiddleWare } from "../middleware/jwt";

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const badRequestStatus = 400;
const notFoundStatus = 404;
const internalServerError = 500;

// Get all users
async function getAllUsers(req: Request, res: Response) {
  try {
    const users: UserDTO[] = await UserService.getAllUsers();

    return res.status(okStatus).json(users);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Get user by ID
async function getUserById(req: Request, res: Response) {
  try {
    const user: UserDTO | null = await UserService.getUserById(Number(req.params.id));

    if (!user) {
      return res.status(notFoundStatus).json({ message: "User not found" });
    }

    return res.status(okStatus).json(user);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Create a new user
async function createUser(req: Request, res: Response) {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
  } catch (error: any) {
    return res.status(internalServerError).json({ message: "Ensure the password field is correct, please try again" });
  }
  try {
    const userbyemail: UserDTO = await UserService.getUserByEmail(req.body);

    if (userbyemail) {
      return res
        .status(badRequestStatus)
        .json({ message: "Error creating user, user already exists with this email, please try again" });
    }

    const user: UserDTO = await UserService.createUser(req.body);

    if (!user) {
      return res.status(badRequestStatus).json({ message: "Error creating user, please try again" });
    }

    const accessToken = JwtMiddleWare.signAccessToken({
      userid: user.id,
    });
    const refreshToken = JwtMiddleWare.signRefreshToken({
      userid: user.id,
    });

    return res.status(createdStatus).json({ accessToken, refreshToken, user });
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

async function signInUser(req: Request, res: Response) {
  try {
    const user = await UserService.getUserByEmail(req.body);
    if (!user) {
      return res.status(internalServerError).json({ message: "No user with email provided exists, please try again" });
    }

    const checkPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!checkPassword) {
      return res.status(internalServerError).json({ message: "Password is incorrect, please try again" });
    }

    const accessToken = JwtMiddleWare.signAccessToken({
      userid: user.id,
    });
    const refreshToken = JwtMiddleWare.signRefreshToken({
      userid: user.id,
    });
    res.status(okStatus).json({ accessToken, refreshToken });
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Genreate a new accessToken from refreshToken
async function generateNewAccessToken(req: Request, res: Response) {
  try {
    const data = await UserService.generateNewAccessToken(req.body);
    return res.status(okStatus).json({
      accessToken: data,
    });
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Update an existing user
async function updateUser(req: Request, res: Response) {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
  } catch (error: any) {
    return res.status(internalServerError).json({ message: "Ensure the password field is correct, please try again" });
  }
  try {
    const user: UserDTO | null = await UserService.updateUser(Number(req.params.id), req.body);

    if (!user) {
      return res.status(notFoundStatus).json({ message: "User not found" });
    }

    return res.status(okStatus).json(user);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Delete a user
async function deleteUser(req: Request, res: Response) {
  try {
    const userDeleted = await UserService.deleteUser(Number(req.params.id));

    if (!userDeleted) {
      return res.status(notFoundStatus).json({ message: "User not found" });
    }

    return res.sendStatus(noContentStatus);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

export { getAllUsers, generateNewAccessToken, getUserById, createUser, signInUser, updateUser, deleteUser };
