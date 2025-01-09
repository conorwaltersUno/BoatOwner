import { prisma } from "../utilities";
import { LogDTO, CreateLogDTO, UpdateLogDTO, AddCoordinatesDTO, Coordinate } from "../interfaces/log";
import { JsonValue } from "type-fest";

async function getAllLogs(): Promise<LogDTO[] | null> {
  try {
    return await prisma.logs.findMany({
      orderBy: {
        id: "asc",
      },
    });
  } catch (error: any) {
    throw new Error("Error retrieving logs: " + error.message);
  }
}

async function getLogById(logId: number): Promise<LogDTO | null> {
  try {
    return await prisma.logs.findUnique({
      where: {
        id: logId,
      },
    });
  } catch (error: any) {
    throw new Error(`No log found with id: ${logId}`);
  }
}

async function getLogsByBoatId(boatId: number): Promise<LogDTO[]> {
  try {
    return await prisma.logs.findMany({
      where: {
        boat_id: boatId,
      },
      orderBy: {
        id: "asc",
      },
    });
  } catch (error: any) {
    throw new Error(`Error retrieving logs for boat with id: ${boatId} - ${error.message}`);
  }
}

async function createLog(boatId: number, data: CreateLogDTO): Promise<LogDTO> {
  try {
    const newLog = await prisma.logs.create({
      data: {
        boat_id: boatId,
        description: data.description,
        crew_members: data.crew_members,
        coordinates: data.coordinates,
        photo_urls: data.photo_urls,
        log_started: data.log_started,
        log_ended: data.log_ended,
        created_on: data.created_on,
        isrecordinglocation: data.isrecordinglocation,
      },
    });

    return newLog;
  } catch (error: any) {
    throw new Error("Error creating log: " + error.message);
  }
}

async function updateLog(logId: number, data: UpdateLogDTO): Promise<LogDTO | null> {
  try {
    const updatedLog = await prisma.logs.update({
      where: {
        id: logId,
      },
      data: {
        boat_id: data.boat_id,
        description: data.description,
        crew_members: data.crew_members,
        coordinates: data.coordinates,
        photo_urls: data.photo_urls,
        log_started: data.log_started,
        log_ended: data.log_ended,
        isrecordinglocation: data.isrecordinglocation,
      },
    });

    return updatedLog;
  } catch (error: any) {
    throw new Error(`Error updating log with id: ${logId} - ${error.message}`);
  }
}

async function addCoordinates(data: AddCoordinatesDTO): Promise<LogDTO | null> {
  try {
    // Fetch the current log to get existing coordinates
    const currentLog = await prisma.logs.findUnique({
      where: {
        id: data.log_id,
      },
      select: {
        coordinates: true,
        isrecordinglocation: true,
      },
    });

    if (!currentLog) {
      throw new Error(`Log with id: ${data.log_id} not found`);
    }

    const existingCoordinates = currentLog.coordinates as JsonValue;
    const newCoordinates = data.coordinates as JsonValue[];

    const existingCoordsArray = Array.isArray(existingCoordinates) ? existingCoordinates : [];

    const updatedCoordinates: JsonValue = [...existingCoordsArray, ...newCoordinates];

    const updatedLog = await prisma.logs.update({
      where: {
        id: data.log_id,
      },
      data: {
        coordinates: updatedCoordinates,
      },
    });

    return updatedLog;
  } catch (error: any) {
    throw new Error(`Error adding coordinates to log with id: ${data.log_id} - ${error.message}`);
  }
}

async function deleteLog(logId: number): Promise<boolean> {
  try {
    await prisma.logs.delete({
      where: {
        id: logId,
      },
    });

    return true;
  } catch (error: any) {
    throw new Error(`Error deleting log with id: ${logId} - ${error.message}`);
  }
}

const LogService = {
  getAllLogs,
  getLogById,
  getLogsByBoatId,
  createLog,
  updateLog,
  addCoordinates,
  deleteLog,
};

export { LogService };
