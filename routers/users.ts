import Router, { RequestHandler } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  signInUser,
  generateNewAccessToken,
} from "../controllers";
import { validator } from "../middleware/expressValidator";
import { body, param } from "express-validator";

const UserRouter = Router();

// Get all users
UserRouter.route("/").get(
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Get all users'
      #swagger.responses[200] = {
        description: 'Successfully retrieved list of users',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getAllUserResponse' }
          }
        }
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  (async (req, res) => {
    await getAllUsers(req, res);
  }) as RequestHandler
);

// Get user by ID
UserRouter.route("/:id").get(
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Get user by ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'User ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved user data',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getUserByIdResponse' }
          }
        }
      }
      #swagger.responses[404] = {
        description: "User not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getUserById(req, res);
  }) as RequestHandler
);

// Create a new user
UserRouter.route("/").post(
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Sign up'
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'P@ssw0rd' }
              },
              required: ['email', 'password']
            }
          }
        }
      }
      #swagger.responses[201] = {
        description: 'User created successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createUserResponse' }
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
    body("email").exists().isEmail().withMessage("This request requires a valid email"),
    body("password").exists().isString().notEmpty().withMessage("This request requires a valid password"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await createUser(req, res);
  }) as RequestHandler
);

// Sign in
UserRouter.route("/sign-in").post(
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Sign-in'
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'P@ssw0rd' }
              },
              required: ['email', 'password']
            }
          }
        }
      }
      #swagger.responses[201] = {
        description: 'Signed in successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/signInUserResponse' }
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
    body("email").exists().isEmail().withMessage("This request requires a valid email"),
    body("password").exists().isString().notEmpty().withMessage("This request requires a valid password"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await signInUser(req, res);
  }) as RequestHandler
);

// Generate a new accessToken using refreshToken
UserRouter.route("/token").post(
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Get a new refresh token from access token'
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJpZCI6NH0sImlhdCI6MTcyNDE1MDU1OCwiZXhwIjoxNzI0MTUyMzU4fQ.Gy2YtEi8dY419wPzcxQ1EkR5MNkNXRlSP6tZOeMNJtQ' },
              }
            }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'New Access Token generated',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/accessToken' }
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
  [body("refreshToken").isString().withMessage("RefreshToken is required")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await generateNewAccessToken(req, res);
  }) as RequestHandler
);

// Update an existing user
UserRouter.route("/:id").put(
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Update an existing user'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'User ID',
        schema: { type: 'integer' }
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'NewP@ssw0rd' }
              }
            }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'User updated successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/updateUserResponse' }
          }
        }
      }
      #swagger.responses[400] = {
        description: "Invalid input data"
      }
      #swagger.responses[404] = {
        description: "User not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("password").optional().isString().notEmpty().withMessage("Password cannot be empty"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await updateUser(req, res);
  }) as RequestHandler
);

// Delete a user
UserRouter.route("/:id").delete(
  /*
      #swagger.tags = ['User']
      #swagger.summary = 'Delete a user'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'User ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[204] = {
        description: 'User deleted successfully'
      }
      #swagger.responses[404] = {
        description: "User not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await deleteUser(req, res);
  }) as RequestHandler
);

export { UserRouter };
