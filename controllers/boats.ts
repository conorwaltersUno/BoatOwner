import { Request, Response } from "express";
import { BoatDTO } from "../interfaces/boats";
import { BoatService, UserService } from "../services";
import { UserDTO } from "../interfaces/user";

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const badRequestStatus = 400;
const notFoundStatus = 404;
const internalServerError = 500;

// Get all boats
async function getAllBoats(req: Request, res: Response) {
  try {
    const boats: BoatDTO[] = await BoatService.getAllBoats();

    return res.status(okStatus).json(boats);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Get boat by ID
async function getBoatById(req: Request, res: Response) {
  try {
    const boat: BoatDTO | null = await BoatService.getBoatById(Number(req.params.id));

    if (!boat) {
      return res.status(notFoundStatus).json({ message: "Boat not found" });
    }

    return res.status(okStatus).json(boat);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Create a new boat
async function createBoat(req: Request, res: Response) {
  try {
    const user: UserDTO = await UserService.getUserById(req.body.user_id);
    if (!user) {
      return res.status(badRequestStatus).json({ message: "Error creating boat, user id does not exist in database" });
    }
    const boat: BoatDTO = await BoatService.createBoat(req.body);

    if (!boat) {
      return res.status(badRequestStatus).json({ message: "Error creating boat, please try again" });
    }

    return res.status(createdStatus).json(boat);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Update an existing boat
async function updateBoat(req: Request, res: Response) {
  try {
    const boat: BoatDTO | null = await BoatService.updateBoat(Number(req.params.id), req.body);

    if (!boat) {
      return res.status(notFoundStatus).json({ message: "Boat not found" });
    }

    return res.status(okStatus).json(boat);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Delete a boat
async function deleteBoat(req: Request, res: Response) {
  try {
    const boatDeleted = await BoatService.deleteBoat(Number(req.params.id));

    if (!boatDeleted) {
      return res.status(notFoundStatus).json({ message: "Boat not found" });
    }

    return res.sendStatus(noContentStatus);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

export { getAllBoats, getBoatById, createBoat, updateBoat, deleteBoat };
