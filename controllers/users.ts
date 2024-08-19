// controllers/userController.ts

import { Request, Response } from "express";
import { UserService } from "../services";
import { UserDTO } from "../interfaces/user";

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
    const user: UserDTO = await UserService.createUser(req.body);

    if (!user) {
      return res.status(badRequestStatus).json({ message: "Error creating user, please try again" });
    }

    return res.status(createdStatus).json(user);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Update an existing user
async function updateUser(req: Request, res: Response) {
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

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
