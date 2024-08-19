import { prisma } from "../utilities";
import { BoatDTO, CreateBoatDTO, UpdateBoatDTO } from "../interfaces/boats";

async function getAllBoats(): Promise<BoatDTO[]> {
  try {
    return await prisma.boat.findMany({
      orderBy: {
        id: "asc",
      },
    });
  } catch (error: any) {
    throw Error("Error retrieving boats: " + error.message);
  }
}

async function getBoatById(boatId: number): Promise<BoatDTO | null> {
  try {
    return await prisma.boat.findUnique({
      where: {
        id: boatId,
      },
    });
  } catch (error: any) {
    throw Error(`No boat found with id: ${boatId}`);
  }
}

async function createBoat(data: CreateBoatDTO): Promise<BoatDTO> {
  try {
    const newBoat = await prisma.boat.create({
      data: {
        user_id: data.user_id,
        name: data.name,
        model: data.model,
      },
    });

    return newBoat;
  } catch (error: any) {
    throw Error("Error creating boat: " + error.message);
  }
}

async function updateBoat(boatId: number, data: UpdateBoatDTO): Promise<BoatDTO | null> {
  try {
    const updatedBoat = await prisma.boat.update({
      where: {
        id: boatId,
      },
      data: {
        user_id: data.user_id,
        name: data.name,
        model: data.model,
      },
    });

    return updatedBoat;
  } catch (error: any) {
    throw Error(`Error updating boat with id: ${boatId} - ${error.message}`);
  }
}

async function deleteBoat(boatId: number): Promise<boolean> {
  try {
    await prisma.boat.delete({
      where: {
        id: boatId,
      },
    });

    return true;
  } catch (error: any) {
    throw Error(`Error deleting boat with id: ${boatId} - ${error.message}`);
  }
}

const BoatService = {
  getAllBoats,
  getBoatById,
  createBoat,
  updateBoat,
  deleteBoat,
};

export { BoatService };
