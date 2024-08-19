export interface BoatDTO {
  id: number;
  user_id: number;
  name: string;
  model: string;
}

export interface CreateBoatDTO {
  user_id: number;
  name: string;
  model: string;
}

export interface UpdateBoatDTO {
  user_id: number;
  name: string;
  model: string;
}
