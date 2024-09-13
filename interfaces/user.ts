export interface UserDTO {
  id: number;
  email: string;
  password: string;
}

export interface CreateUserDTO {
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
