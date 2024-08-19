import { Request, Response } from "express";
import { idText } from "typescript";
import { BoatDTO } from "../interfaces/boats";
import { LogDTO, CreateLogDTO, UpdateLogDTO, AddCoordinatesDTO } from "../interfaces/log";
import { BoatService } from "../services/boats";
import { LogService } from "../services/logs";
import { body } from "express-validator";

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const badRequestStatus = 400;
const notFoundStatus = 404;
const internalServerError = 500;

// Get all logs
async function getAllLogs(req: Request, res: Response) {
  try {
    const logs: LogDTO[] = await LogService.getAllLogs();

    if (!logs.length) {
      return res.status(204).json([]);
    }

    return res.status(okStatus).json(logs);
  } catch (error: any) {
    res.status(internalServerError).json({ message: error.message });
  }
}

// Get logs by boat ID
async function getLogsByBoatId(req: Request, res: Response) {
  try {
    const boat: BoatDTO = await BoatService.getBoatById(Number(req.params.boat_id));

    if (!boat) {
      return res.status(notFoundStatus).json({ message: `No boat found for boatId: ${Number(req.params.boat_id)}` });
    }

    const logs: LogDTO[] = await LogService.getLogsByBoatId(Number(req.params.boat_id));

    if (!logs.length) {
      return res.status(notFoundStatus).json({ message: `No Logs found for boatId: ${Number(req.params.boat_id)}` });
    }

    return res.status(okStatus).json(logs);
  } catch (error: any) {
    res.status(internalServerError).json({ message: error.message });
  }
}

// Get log by ID
async function getLogById(req: Request, res: Response) {
  try {
    const log: LogDTO | null = await LogService.getLogById(Number(req.params.id));

    if (!log) {
      return res.status(notFoundStatus).json({ message: "Log not found" });
    }

    return res.status(okStatus).json(log);
  } catch (error: any) {
    res.status(internalServerError).json({ message: error.message });
  }
}

// Create a new log
async function createLog(req: Request, res: Response) {
  try {
    const boat = await BoatService.getBoatById(Number(req.params.boat_id));

    if (!boat) {
      return res.status(badRequestStatus).json({ message: "Boat ID does not exist in the database" });
    }

    const newLog: LogDTO = await LogService.createLog(Number(req.params.boat_id), req.body);

    return res.status(createdStatus).json(newLog);
  } catch (error: any) {
    res.status(internalServerError).json({ message: error.message });
  }
}

// Update an existing log
async function updateLog(req: Request, res: Response) {
  try {
    const log: LogDTO | null = await LogService.updateLog(Number(req.params.id), req.body as UpdateLogDTO);

    if (!log) {
      return res.status(notFoundStatus).json({ message: "Log not found" });
    }

    return res.status(okStatus).json(log);
  } catch (error: any) {
    res.status(internalServerError).json({ message: error.message });
  }
}

// Add coordinates to a log
async function addCoordinates(req: Request, res: Response) {
  try {
    const logExists = await LogService.getLogById(req.body.log_id);
    if (!logExists) {
      return res.status(notFoundStatus).json({ message: "Log not found" });
    }

    const updatedLog = await LogService.addCoordinates(req.body as AddCoordinatesDTO);

    return res.status(okStatus).json(updatedLog);
  } catch (error: any) {
    res.status(internalServerError).json({ message: error.message });
  }
}

// Delete a log
async function deleteLog(req: Request, res: Response) {
  try {
    const logDeleted = await LogService.deleteLog(Number(req.params.id));

    if (!logDeleted) {
      return res.status(notFoundStatus).json({ message: "Log not found" });
    }

    return res.sendStatus(noContentStatus);
  } catch (error: any) {
    res.status(internalServerError).json({ message: error.message });
  }
}

export { getAllLogs, getLogsByBoatId, getLogById, createLog, updateLog, addCoordinates, deleteLog };
