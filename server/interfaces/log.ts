import { JsonValue } from "type-fest";

export interface Coordinate {
  x: number;
  y: number;
}

export interface LogDTO {
  id: number;
  boat_id: number;
  description: string;
  crew_members: string[];
  coordinates: JsonValue; // JSON value to support array of Coordinate objects
  photo_urls: string[];
  log_started: Date; // Date type for timestamps
  log_ended: Date; // Date type for timestamps
  created_on: Date; // Date type for timestamps
  isrecordinglocation: boolean;
}

export interface CreateLogDTO {
  description: string;
  crew_members: string[];
  coordinates: JsonValue; // JSON value to support array of Coordinate objects
  photo_urls: string[];
  log_started: Date; // Date type for timestamps
  log_ended: Date; // Date type for timestamps
  created_on: Date; // Date type for timestamps
  isrecordinglocation: boolean;
}

export interface UpdateLogDTO {
  boat_id?: number;
  description?: string;
  crew_members?: string[];
  coordinates?: JsonValue; // JSON value to support array of Coordinate objects
  photo_urls?: string[];
  log_started?: Date; // Date type for timestamps
  log_ended?: Date; // Date type for timestamps
  isrecordinglocation?: boolean;
}

export interface AddCoordinatesDTO {
  log_id: number;
  coordinates: JsonValue; // JSON value to support array of Coordinate objects
}
