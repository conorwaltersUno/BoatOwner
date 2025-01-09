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
  ],
  photo_urls: [],
  log_started: new Date(),
  log_ended: new Date(),
  created_on: new Date(),
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
    ],
    photo_urls: [],
    log_started: new Date(),
    log_ended: new Date(),
    created_on: new Date(),
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
  log_started: new Date(),
  log_ended: new Date(),
  created_on: new Date(),
  isrecordinglocation: false,
};
