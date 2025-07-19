import Router, { RequestHandler } from "express";
import {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  getPendingRequests,
  getFriendsLogs,
  searchUsers,
} from "../controllers/friends";
import { validator } from "../middleware/expressValidator";
import { body, param, query } from "express-validator";

const FriendsRouter = Router();

// Send a friend request
FriendsRouter.route("/request").post(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Send a friend request'
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', example: 'friend@email.com' },
                userId: { type: 'integer', example: 2 }
              }
            }
          }
        }
      }
      #swagger.responses[201] = { description: 'Friend request sent' }
      #swagger.responses[400] = { description: 'Bad request' }
      #swagger.responses[404] = { description: 'User not found' }
      #swagger.responses[500] = { description: 'Internal server error' }
    */
  [
    body("email").optional().isEmail().withMessage("Email must be valid"),
    body("userId").optional().isInt().withMessage("User ID must be an integer"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await sendFriendRequest(req, res);
  }) as RequestHandler
);

// Respond to a friend request
FriendsRouter.route("/respond").post(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Respond to a friend request'
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                requestId: { type: 'integer', example: 1 },
                accept: { type: 'boolean', example: true }
              }
            }
          }
        }
      }
      #swagger.responses[200] = { description: 'Friend request responded to' }
      #swagger.responses[400] = { description: 'Bad request' }
      #swagger.responses[403] = { description: 'Not authorized' }
      #swagger.responses[404] = { description: 'Friend request not found' }
      #swagger.responses[500] = { description: 'Internal server error' }
    */
  [
    body("requestId").isInt().withMessage("Request ID must be an integer"),
    body("accept").isBoolean().withMessage("Accept must be a boolean"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await respondToFriendRequest(req, res);
  }) as RequestHandler
);

// Get all friends for a user
FriendsRouter.route("/:userId").get(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Get all friends for a user'
      #swagger.parameters['userId'] = {
        in: 'path',
        required: true,
        description: 'User ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = { description: 'List of friends' }
      #swagger.responses[500] = { description: 'Internal server error' }
    */
  [param("userId").isInt().withMessage("User ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getFriends(req, res);
  }) as RequestHandler
);

// Remove a friend
FriendsRouter.route("/:friendId").delete(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Remove a friend'
      #swagger.parameters['friendId'] = {
        in: 'path',
        required: true,
        description: 'Friend ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[204] = { description: 'Friend removed' }
      #swagger.responses[404] = { description: 'Friend relationship not found' }
      #swagger.responses[500] = { description: 'Internal server error' }
    */
  [param("friendId").isInt().withMessage("Friend ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await removeFriend(req, res);
  }) as RequestHandler
);

// Get all pending friend requests for a user
FriendsRouter.route("/requests/:userId").get(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Get all pending friend requests for a user'
      #swagger.parameters['userId'] = {
        in: 'path',
        required: true,
        description: 'User ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = { description: 'List of pending friend requests' }
      #swagger.responses[500] = { description: 'Internal server error' }
    */
  [param("userId").isInt().withMessage("User ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getPendingRequests(req, res);
  }) as RequestHandler
);

// Get all logs for all friends of a user
FriendsRouter.route("/:userId/logs").get(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Get all logs for all friends of a user'
      #swagger.parameters['userId'] = {
        in: 'path',
        required: true,
        description: 'User ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = { description: 'List of logs for all friends' }
      #swagger.responses[500] = { description: 'Internal server error' }
    */
  [param("userId").isInt().withMessage("User ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getFriendsLogs(req, res);
  }) as RequestHandler
);

// Search for users to add as friends
FriendsRouter.route("/search").post(
  [body("q").isString().isLength({ min: 2 }).withMessage("Query must be at least 2 characters")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await searchUsers(req, res);
  }) as RequestHandler
);

FriendsRouter.route("/requests/:id").delete(
  /*
      #swagger.tags = ['Friends']
      #swagger.summary = 'Cancel a pending friend request'
      #swagger.parameters['id'] = {
        in: 'path', required: true, description: 'Friend request ID', schema: { type: 'integer' }
      }
      #swagger.responses[204] = { description: 'Friend request canceled' }
      #swagger.responses[400] = { description: 'Invalid request ID' }
      #swagger.responses[401] = { description: 'Unauthorized' }
      #swagger.responses[404] = { description: 'Request not found' }
      #swagger.responses[500] = { description: 'Internal server error' }
    */
  auth,
  [param("id").isInt().withMessage("Request ID must be an integer")],
  (req, res, next) => { validator(req, res, next); },
  (async (req, res) => { await cancelPendingFriendRequestController(req, res); }) as RequestHandler
);

export { FriendsRouter };
