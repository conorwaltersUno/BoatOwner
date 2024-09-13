export const definitions = {
  //User Definitions
  userDTO: {
    id: 1,
    email: "email@gmail.com",
    password:
      "$2b$08$mdR4psJFv41YzWl0YX0BQu5l78QDPCxTbr02YcM/i1pK4qbXmNwsC$2b$08$$2b$08$mdR4psJFv41YzWl0YX0BQu5l78QDPCxTbr02YcM/i1pK4qbXmNwsC/i1pK4qbXmNwsC",
  },
  createUserDTO: {
    email: "email@gmail.com",
    password: "$2b$08$mdR4psJFv41YzWl0YX0BQu5l78QDPCxTbr02YcM/i1pK4qbXmNwsC",
  },
  updateUserDTO: {
    email: "email@gmail.com",
    password: "$2b$08$mdR4psJFv41YzWl0YX0BQu5l78QDPCxTbr02YcM/i1pK4qbXmNwsC",
  },
  accessToken: {
    accessToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJpZCI6Nn0sImlhdCI6MTcyNDE0NzY3MSwiZXhwIjoxNzI0MTQ5NDcxfQ.ZiMYxY71XFBQ49xrygh5LLufxm-ApVRoZa5A1_4nhmA",
  },
  refreshToken: {
    refreshToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJpZCI6Nn0sImlhdCI6MTcyNDE0NzY3MSwiZXhwIjoxNzI2NzM5NjcxfQ.AHT6JI6MQgg39AJtPBQhEDqt0TuUAKda-wF9fINKHSk",
  },
  getAllUserResponse: [{ $ref: "#/definitions/userDTO" }],
  getUserByIdResponse: { $ref: "#/definitions/userDTO" },
  createUserResponse: {
    accessToken: { $ref: "#/definitions/accessToken/properties/accessToken" },
    refreshToken: { $ref: "#/definitions/refreshToken/properties/refreshToken" },
    user: { $ref: "#/definitions/userDTO" },
  },
  updateUserResponse: { $ref: "#/definitions/userDTO" },
  signInUserResponse: {
    accessToken: { $ref: "#/definitions/accessToken/properties/accessToken" },
    refreshToken: { $ref: "#/definitions/refreshToken/properties/refreshToken" },
  },

  //Boat Definitions
  boatDTO: {
    id: 1,
    user_id: 1,
    name: "Boaty McBoatface",
    model: "X200",
  },
  createBoatDTO: {
    user_id: 1,
    name: "New Boat",
    model: "Z300",
  },
  updateBoatDTO: {
    user_id: 1,
    name: "Updated Boat",
    model: "Z300",
  },
  getAllBoatsResponse: [{ $ref: "#/definitions/boatDTO" }],
  getBoatByIdResponse: { $ref: "#/definitions/boatDTO" },
  createBoatResponse: { $ref: "#/definitions/boatDTO" },
  updateBoatResponse: { $ref: "#/definitions/boatDTO" },

  // Log Definitions
  logDTO: {
    id: 1,
    boat_id: 1,
    description: "Departed from dock",
    crew_members: ["Alice", "Bob"],
    coordinates: [
      { x: 41.8781, y: -87.6298 },
      { x: 34.0522, y: -118.2437 },
    ],
    photo_urls: ["http://example.com/photo1.jpg", "http://example.com/photo2.jpg"],
    log_started: "2023-07-01T08:00:00Z",
    log_ended: "2023-07-01T12:00:00Z",
    created_on: "2023-07-01T08:00:00Z",
    isrecordinglocation: true,
  },
  createLogDTO: {
    description: "New log entry",
    crew_members: ["Eve", "Frank"],
    coordinates: [
      { x: 41.8781, y: -87.6298 },
      { x: 34.0522, y: -118.2437 },
    ],
    photo_urls: ["http://example.com/photo5.jpg", "http://example.com/photo6.jpg"],
    log_started: "2023-07-03T07:00:00Z",
    log_ended: "2023-07-03T11:00:00Z",
    isrecordinglocation: true,
  },
  updateLogDTO: {
    boat_id: 1,
    description: "Updated log entry",
    crew_members: ["George", "Hannah"],
    coordinates: [
      { x: 41.8781, y: -87.6298 },
      { x: 34.0522, y: -118.2437 },
    ],
    photo_urls: ["http://example.com/photo7.jpg", "http://example.com/photo8.jpg"],
    log_started: "2023-07-04T08:00:00Z",
    log_ended: "2023-07-04T12:00:00Z",
    isrecordinglocation: false,
  },
  addCoordinatesDTO: {
    log_id: 1,
    coordinates: [
      { x: 41.8781, y: -87.6298 },
      { x: 34.0522, y: -118.2437 },
    ],
  },
  getAllLogsResponse: [{ $ref: "#/definitions/logDTO" }],
  getLogsByBoatIdResponse: [{ $ref: "#/definitions/logDTO" }],
  getLogByIdResponse: { $ref: "#/definitions/logDTO" },
  createLogResponse: { $ref: "#/definitions/logDTO" },
  updateLogResponse: { $ref: "#/definitions/logDTO" },
  addCoordinatesResponse: { $ref: "#/definitions/logDTO" },

  //task definitions
  taskDTO: {
    id: 1,
    boat_id: 1,
    description: "Departed from dock",
    status: "To Complete",
    created_on: "2023-07-04T12:00:00Z",
  },
  createTaskDTO: {
    description: "Departed from dock",
    status: "To Complete",
    created_on: "2023-07-04T12:00:00Z",
  },
  getAllTasksResponse: [{ $ref: "#/definitions/taskDTO" }],
  getTasksByBoatIdResponse: [{ $ref: "#/definitions/taskDTO" }],
  getTaskByIdResponse: { $ref: "#/definitions/taskDTO" },
  createTaskResponse: { $ref: "#/definitions/taskDTO" },
  updateTaskResponse: { $ref: "#/definitions/taskDTO" },
};
