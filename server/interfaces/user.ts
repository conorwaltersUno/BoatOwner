export interface UserDTO {
  id: number;
  email: string;
  password: string;
  username: string | null; // Nullable to match database schema
  created: string;
}

export interface CreateUserDTO {
  boat_name: string;
  boat_model: string;
  email: string;
  password: string;
  username: string; // Required for creation
}

export interface refreshTokenDTO {
  refreshToken: string;
}

export interface UpdateUserDTO {
  email: string;
  password: string;
}
