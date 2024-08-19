export const definitions = {
  //User Definitions
  userDTO: {
    id: 1,
    email: "email@gmail.com",
    password: "password",
  },
  createUserDTO: {
    email: "email@gmail.com",
    password: "password",
  },
  updateUserDTO: {
    email: "email@gmail.com",
    password: "password",
  },
  getAllUserResponse: [{ $ref: "#/definitions/userDTO" }],
  getUserByIdResponse: { $ref: "#/definitions/userDTO" },
  createUserResponse: { $ref: "#/definitions/userDTO" },
  updateUserResponse: { $ref: "#/definitions/userDTO" },

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
};
