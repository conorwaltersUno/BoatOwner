import Router, { RequestHandler } from "express";
import { validator } from "../middleware/expressValidator";
import { body, param } from "express-validator";
import {
  addCoordinates,
  createLog,
  deleteLog,
  getAllLogs,
  getLogById,
  getLogsByBoatId,
  updateLog,
} from "../controllers/logs";
import { auth } from "../middleware/auth";

const LogRouter = Router();

// Get all logs
LogRouter.route("/").get(
  /*
      #swagger.tags = ['log']
      #swagger.summary = 'Get all logs'
      #swagger.responses[200] = {
        description: 'Successfully retrieved list of logs',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getAllLogsResponse' }
          }
        }
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  (async (req, res) => {
    await getAllLogs(req, res);
  }) as RequestHandler
);

// Get logs by boat ID
LogRouter.route("/boat/:boat_id").get(
  /*
      #swagger.tags = ['log']
      #swagger.summary = 'Get logs by boat ID'
      #swagger.parameters['boat_id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved logs for the boat',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getLogsByBoatIdResponse' }
          }
        }
      }
      #swagger.responses[404] = {
        description: "Boat not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [param("boat_id").isInt().withMessage("Boat ID must be an integer")],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getLogsByBoatId(req, res);
  }) as RequestHandler
);

// Get log by ID
LogRouter.route("/:id").get(
  /*
      #swagger.tags = ['log']
      #swagger.summary = 'Get log by ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Log ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved log data',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getLogByIdResponse' }
          }
        }
      }
      #swagger.responses[404] = {
        description: "Log not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [param("id").isInt().withMessage("ID must be an integer")],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getLogById(req, res);
  }) as RequestHandler
);

// Add coordinates to a log
LogRouter.route("/coordinates").post(
  /*
        #swagger.tags = ['log']
        #swagger.summary = 'Add coordinates to a log'
        #swagger.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: '#/definitions/addCoordinatesDTO' }
            }
          }
        }
        #swagger.responses[200] = {
          description: 'Coordinates added successfully',
          content: {
            "application/json": {
              schema: { $ref: '#/definitions/addCoordinatesResponse' }
            }
          }
        }
        #swagger.responses[400] = {
          description: "Invalid input data"
        }
        #swagger.responses[404] = {
          description: "Log not found"
        }
        #swagger.responses[500] = {
          description: "Internal server error"
        }
      */
  [
    body("log_id").isInt().withMessage("Log ID must be an integer"),
    body("coordinates").isArray().withMessage("Coordinates must be an array"),
  ],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await addCoordinates(req, res);
  }) as RequestHandler
);

// Create a new log
LogRouter.route("/:boat_id").post(
  /*
      #swagger.tags = ['log']
      #swagger.summary = 'Create a new log'
      #swagger.parameters['boat_id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createLogDTO' }
          }
        }
      }
      #swagger.responses[201] = {
        description: 'Log created successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createLogResponse' }
          }
        }
      }
      #swagger.responses[400] = {
        description: "Invalid input data"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [
    param("boat_id").isInt().withMessage("Boat ID must be an integer"),
    body("description").isString().notEmpty().withMessage("Description is required"),
    body("crew_members").isArray().withMessage("Crew members must be an array"),
    body("coordinates").isArray().withMessage("Coordinates must be an array"),
    body("photo_urls").isArray().withMessage("Photo URLs must be an array"),
    body("log_started").isISO8601().withMessage("Log started must be a valid ISO8601 date"),
    body("log_ended").isISO8601().withMessage("Log ended must be a valid ISO8601 date"),
    body("isrecordinglocation").isBoolean().withMessage("isRecordingLocation must be a boolean"),
  ],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await createLog(req, res);
  }) as RequestHandler
);

// Update an existing log
LogRouter.route("/:id").put(
  /*
      #swagger.tags = ['log']
      #swagger.summary = 'Update an existing log'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Log ID',
        schema: { type: 'integer' }
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/updateLogDTO' }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'Log updated successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/updateLogResponse' }
          }
        }
      }
      #swagger.responses[400] = {
        description: "Invalid input data"
      }
      #swagger.responses[404] = {
        description: "Log not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("boat_id").optional().isInt().withMessage("Boat ID must be an integer"),
    body("description").optional().isString().notEmpty().withMessage("Description cannot be empty"),
    body("crew_members").optional().isArray().withMessage("Crew members must be an array"),
    body("coordinates").optional().isArray().withMessage("Coordinates must be an array"),
    body("photo_urls").optional().isArray().withMessage("Photo URLs must be an array"),
    body("log_started").optional().isISO8601().withMessage("Log started must be a valid ISO8601 date"),
    body("log_ended").optional().isISO8601().withMessage("Log ended must be a valid ISO8601 date"),
    body("isRecordingLocation").optional().isBoolean().withMessage("isRecordingLocation must be a boolean"),
  ],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await updateLog(req, res);
  }) as RequestHandler
);

// Delete a log
LogRouter.route("/:id").delete(
  /*
      #swagger.tags = ['log']
      #swagger.summary = 'Delete a log'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Log ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[204] = {
        description: 'Log deleted successfully'
      }
      #swagger.responses[404] = {
        description: "Log not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [param("id").isInt().withMessage("ID must be an integer")],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await deleteLog(req, res);
  }) as RequestHandler
);

export { LogRouter };
