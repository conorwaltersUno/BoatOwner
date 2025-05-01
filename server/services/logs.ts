import { prisma } from "../utilities";
import { LogDTO, CreateLogDTO, UpdateLogDTO } from "../interfaces/log";
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
        log_started: data.log_started,
        log_ended: data.log_ended,
        created_on: data.created_on,
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
        log_started: data.log_started,
        log_ended: data.log_ended,
      },
    });

    return updatedLog;
  } catch (error: any) {
    throw new Error(`Error updating log with id: ${logId} - ${error.message}`);
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
  deleteLog,
};

export { LogService };
