import Router, { RequestHandler } from "express";
import { getAllBoats, getBoatById, createBoat, updateBoat, deleteBoat } from "../controllers";
import { validator } from "../middleware/expressValidator";
import { body, param } from "express-validator";
import { auth } from "../middleware/auth";

const BoatRouter = Router();

// Get all boats
BoatRouter.route("/").get(
  /*
      #swagger.tags = ['Boat']
      #swagger.summary = 'Get all boats'
      #swagger.responses[200] = {
        description: 'Successfully retrieved list of boats',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getAllBoatsResponse' }
          }
        }
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  (async (req, res) => {
    await getAllBoats(req, res);
  }) as RequestHandler
);

// Get boat by ID
BoatRouter.route("/:id").get(
  /*
      #swagger.tags = ['Boat']
      #swagger.summary = 'Get boat by ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved boat data',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getBoatByIdResponse' }
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
  [param("id").isInt().withMessage("ID must be an integer")],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getBoatById(req, res);
  }) as RequestHandler
);

// Create a new boat
BoatRouter.route("/").post(
  /*
      #swagger.tags = ['Boat']
      #swagger.summary = 'Create a new boat'
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                user_id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'New Boat' },
                model: { type: 'string', example: 'Z300' }
              },
              required: ['user_id', 'name', 'model']
            }
          }
        }
      }
      #swagger.responses[201] = {
        description: 'Boat created successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createBoatResponse' }
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
    body("user_id").exists().isInt().withMessage("This request requires a valid user_id"),
    body("name").exists().isString().notEmpty().withMessage("This request requires a valid name"),
    body("model").exists().isString().notEmpty().withMessage("This request requires a valid model"),
  ],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await createBoat(req, res);
  }) as RequestHandler
);

// Update an existing boat
BoatRouter.route("/:id").put(
  /*
      #swagger.tags = ['Boat']
      #swagger.summary = 'Update an existing boat'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                user_id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Updated Boat' },
                model: { type: 'string', example: 'Z300' }
              }
            }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'Boat updated successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/updateBoatResponse' }
          }
        }
      }
      #swagger.responses[400] = {
        description: "Invalid input data"
      }
      #swagger.responses[404] = {
        description: "Boat not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("user_id").optional().isInt().withMessage("Invalid user_id"),
    body("name").optional().isString().notEmpty().withMessage("Name cannot be empty"),
    body("model").optional().isString().notEmpty().withMessage("Model cannot be empty"),
  ],
  auth,
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await updateBoat(req, res);
  }) as RequestHandler
);

// Delete a boat
BoatRouter.route("/:id").delete(
  /*
      #swagger.tags = ['Boat']
      #swagger.summary = 'Delete a boat'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[204] = {
        description: 'Boat deleted successfully'
      }
      #swagger.responses[404] = {
        description: "Boat not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  auth,
  (async (req, res) => {
    await deleteBoat(req, res);
  }) as RequestHandler
);

export { BoatRouter };
