import Router, { RequestHandler } from "express";
import { getAllTasks, getTaskById, getTasksByBoatId, createTask, updateTask, deleteTask } from "../controllers";
import { validator } from "../middleware/expressValidator";
import { body, param } from "express-validator";
import { auth } from "../middleware/auth";

const TaskRouter = Router();

// Get all tasks
TaskRouter.route("/").get(
  /*
      #swagger.tags = ['Task']
      #swagger.summary = 'Get all tasks'
      #swagger.responses[200] = {
        description: 'Successfully retrieved list of tasks',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getAllTasksResponse' }
          }
        }
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  (async (req, res) => {
    await getAllTasks(req, res);
  }) as RequestHandler
);

// Get task by ID
TaskRouter.route("/:id").get(
  /*
      #swagger.tags = ['Task']
      #swagger.summary = 'Get task by ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Task ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved task data',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getTaskByIdResponse' }
          }
        }
      }
      #swagger.responses[404] = {
        description: "Task not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getTaskById(req, res);
  }) as RequestHandler
);

// Get tasks by boat ID
TaskRouter.route("/boat/:boat_id/tasks").get(
  /*
      #swagger.tags = ['Task']
      #swagger.summary = 'Get tasks by boat ID'
      #swagger.parameters['boat_id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved tasks for the boat',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getTasksByBoatIdResponse' }
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
  auth,
  [param("boat_id").isInt().withMessage("Boat ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getTasksByBoatId(req, res);
  }) as RequestHandler
);

// Create a new task
TaskRouter.route("/:boat_id").post(
  /*
      #swagger.tags = ['Task']
      #swagger.summary = 'Create a new task'
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
            schema: { $ref: '#/definitions/createTaskDTO' }
          }
        }
      }
      #swagger.responses[201] = {
        description: 'Task created successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createTaskResponse' }
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
  auth,
  [
    param("boat_id").isInt().withMessage("Boat ID must be an integer"),
    body("description").exists().isString().notEmpty().withMessage("Description is required"),
    body("status").exists().isString().notEmpty().withMessage("Status is required"),
    body("created_on")
      .exists()
      .isISO8601()
      .toDate()
      .withMessage("Created on date is required and must be a valid ISO8601 date"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await createTask(req, res);
  }) as RequestHandler
);

// Update an existing task
TaskRouter.route("/:id").put(
  /*
      #swagger.tags = ['Task']
      #swagger.summary = 'Update an existing task'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Task ID',
        schema: { type: 'integer' }
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createTaskDTO' }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'Task updated successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/updateTaskResponse' }
          }
        }
      }
      #swagger.responses[400] = {
        description: "Invalid input data"
      }
      #swagger.responses[404] = {
        description: "Task not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("description").optional().isString().notEmpty().withMessage("Description cannot be empty"),
    body("status").optional().isString().notEmpty().withMessage("Status cannot be empty"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await updateTask(req, res);
  }) as RequestHandler
);

// Delete a task
TaskRouter.route("/:id").delete(
  /*
      #swagger.tags = ['Task']
      #swagger.summary = 'Delete a task'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Task ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[204] = {
        description: 'Task deleted successfully'
      }
      #swagger.responses[404] = {
        description: "Task not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await deleteTask(req, res);
  }) as RequestHandler
);

export { TaskRouter };
