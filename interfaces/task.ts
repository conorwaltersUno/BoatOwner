export interface TaskDTO {
  id: number;
  boat_id: number;
  description: string;
  status: string;
  created_on: Date;
}

export interface CreateTaskDTO {
  boat_id: number;
  description: string;
  status: string;
  created_on: Date;
}

export interface UpdateTaskDTO {
  description: string;
  status: string;
  created_on: Date;
}
