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

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
