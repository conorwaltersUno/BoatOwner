import { constants } from "./config/constants";
import { definitions } from "./swaggerSchema/definitions";
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "0.0.1",
    title: "BoatOwner",
    description: "",
  },

  host: constants.HOST_PORT,
  basePath: "",
  schemes: ["https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "User",
      description: "Endpoints",
    },
    {
      name: "Boat",
      description: "Endpoints",
    },
    {
      name: "log",
      description: "Endpoints",
    },
    {
      name: "Task",
      description: "Endpoints",
    },
    {
      name: "Friends",
      description: "Endpoints",
    },
  ],
  definitions: definitions,

  // Add security definitions
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const outputFile = "./swaggerSchema/swagger_output.json";
const endpointsFiles = ["./app.ts"];

/**
 * @swagger
 * /api/friends/requests/{id}:
 *   delete:
 *     summary: Cancel a pending friend request sent by the current user
 *     tags:
 *       - Friends
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the friend request to cancel
 *     responses:
 *       200:
 *         description: Friend request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid request or not pending
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to cancel this request
 *       404:
 *         description: Friend request not found
 */

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
