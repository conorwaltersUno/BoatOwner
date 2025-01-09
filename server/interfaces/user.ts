export interface UserDTO {
  id: number;
  email: string;
  password: string;
}

export interface CreateUserDTO {
  boat_name: string;
  boat_model: string;
  email: string;
  password: string;
}

export interface refreshTokenDTO {
  refreshToken: string;
}

export interface UpdateUserDTO {
  email: string;
  password: string;
}
