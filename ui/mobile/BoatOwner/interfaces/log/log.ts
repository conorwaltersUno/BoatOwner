export interface SaveLogDTO {
  description: string;
  crew_members: string[];
  coordinates: LocationPoint[];
  log_started: Date | null;
  log_ended: Date | null;
  created_on: Date;
}

export interface UpdateLogDTO {
  id: number;
  description: string;
  crew_members: string[];
  coordinates: LocationPoint[];
  log_started: Date | null;
  log_ended: Date | null;
  created_on: Date;
}

export interface LocationPoint {
  index: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface LogDTO {
  id: number;
  boat_id: number;
  description: string;
  crew_members: string[];
  coordinates: CoordinateEntry[];
  log_started: Date;
  log_ended: Date;
  created_on: Date;
}

export interface CoordinateEntry {
  index: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}
