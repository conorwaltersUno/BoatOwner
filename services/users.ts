import { prisma } from "../utilities";
import { UserDTO, CreateUserDTO, UpdateUserDTO, refreshTokenDTO } from "../interfaces/user";
import dayjs from "dayjs";
import { JwtMiddleWare } from "../middleware/jwt";

async function getAllUsers(): Promise<UserDTO[]> {
  try {
    return await prisma.user.findMany({
      orderBy: {
        id: "asc",
      },
    });
  } catch (error: any) {
    throw Error("Error retrieving users: " + error.message);
  }
}

async function getUserById(userId: number): Promise<UserDTO | null> {
  try {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  } catch (error: any) {
    throw Error(`No user found with id: ${userId}`);
  }
}

async function generateNewAccessToken(body: refreshTokenDTO) {
  try {
    const decodedToken: any = await JwtMiddleWare.verifyRefreshToken(body.refreshToken);
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.payload.userid,
      },
    });
    return JwtMiddleWare.signAccessToken({
      userid: user.id,
    });
  } catch (error: any) {
    throw Error(`Error in generating new accessToken: ${error.message}`);
  }
}

async function getUserByEmail(body: CreateUserDTO): Promise<UserDTO | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error: any) {
    throw Error(`Error getting user by email: ${error}`);
  }
}

async function createUser(data: CreateUserDTO): Promise<UserDTO> {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        created: dayjs().format(),
      },
    });

    return newUser;
  } catch (error: any) {
    throw Error("Error creating user: " + error.message);
  }
}

async function updateUser(userId: number, data: UpdateUserDTO): Promise<UserDTO | null> {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email: data.email,
        password: data.password,
      },
    });

    return updatedUser;
  } catch (error: any) {
    throw Error(`Error updating user with id: ${userId} - ${error.message}`);
  }
}

async function deleteUser(userId: number): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return true;
  } catch (error: any) {
    throw Error(`Error deleting user with id: ${userId} - ${error.message}`);
  }
}

const UserService = {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  generateNewAccessToken,
  updateUser,
};

export { UserService };
