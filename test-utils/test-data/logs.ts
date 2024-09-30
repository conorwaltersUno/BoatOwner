import { CreateLogDTO, LogDTO } from "../../interfaces/log";

export const MockLog: LogDTO = {
  id: 1,
  boat_id: 1,
  description: "new log",
  crew_members: ["conor"],
  coordinates: [
    { x: 10, y: 20 },
    { x: 10, y: 20 },
    { x: 10, y: 20 },
  ], // JSON value to support array of Coordinate objects
  photo_urls: [],
  log_started: new Date(), // Date type for timestamps
  log_ended: new Date(), // Date type for timestamps
  created_on: new Date(), // Date type for timestamps
  isrecordinglocation: false,
};

export const MockLogArray: LogDTO[] = [
  {
    id: 1,
    boat_id: 1,
    description: "new log",
    crew_members: ["conor"],
    coordinates: [
      { x: 10, y: 20 },
      { x: 10, y: 20 },
      { x: 10, y: 20 },
    ], // JSON value to support array of Coordinate objects
    photo_urls: [],
    log_started: new Date(), // Date type for timestamps
    log_ended: new Date(), // Date type for timestamps
    created_on: new Date(), // Date type for timestamps
    isrecordinglocation: false,
  },
];

export const MockLogCreate: CreateLogDTO = {
  description: "new log",
  crew_members: ["conor"],
  coordinates: [
    { x: 10, y: 20 },
    { x: 10, y: 20 },
    { x: 10, y: 20 },
  ],
  photo_urls: [],
  log_started: new Date(), // Date type for timestamps
  log_ended: new Date(), // Date type for timestamps
  created_on: new Date(), // Date type for timestamps
  isrecordinglocation: false,
};
