import { JsonValue } from "type-fest";

export interface LogDTO {
  id: number;
  boat_id: number;
  description: string;
  crew_members: string[];
  coordinates: JsonValue;
  log_started: Date;
  log_ended: Date;
  created_on: Date;
}

export interface CreateLogDTO {
  description: string;
  crew_members: string[];
  coordinates: JsonValue;
  log_started: Date;
  log_ended: Date;
  created_on: Date;
  duration: Number;
}

export interface UpdateLogDTO {
  boat_id?: number;
  description?: string;
  crew_members?: string[];
  coordinates?: JsonValue;
  log_started?: Date;
  log_ended?: Date;
}
