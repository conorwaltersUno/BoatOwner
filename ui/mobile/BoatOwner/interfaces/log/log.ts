export interface SaveLogDTO {
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
