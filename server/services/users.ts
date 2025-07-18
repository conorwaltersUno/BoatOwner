import { prisma } from "../utilities";
import { UserDTO, CreateUserDTO, UpdateUserDTO, refreshTokenDTO } from "../interfaces/user";
import dayjs from "dayjs";
import { JwtMiddleWare } from "../middleware/jwt";
import { BoatDTO } from "../interfaces/boats";

async function getAllUsers(): Promise<UserDTO[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });
    return users.map(u => ({ ...u, created: u.created instanceof Date ? u.created.toISOString() : u.created }));
  } catch (error: any) {
    throw Error("Error retrieving users: " + error.message);
  }
}

async function getUserById(userId: number): Promise<UserDTO | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user ? { ...user, created: user.created instanceof Date ? user.created.toISOString() : user.created } : null;
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
      where: { email: body.email },
    });
    return user ? { ...user, created: user.created instanceof Date ? user.created.toISOString() : user.created } : null;
  } catch (error: any) {
    throw Error(`Error getting user by email: ${error}`);
  }
}

async function createUser(data: CreateUserDTO): Promise<{ UserDTO; BoatDTO }> {
  // Username uniqueness validation
  const existingUser = await prisma.user.findUnique({ where: { username: data.username } });
  if (existingUser) throw new Error("Username already exists");
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      username: data.username,
      created: dayjs().toISOString(),
    },
  });
  const boat = await prisma.boat.create({
    data: {
      user_id: newUser.id,
      name: data.boat_name,
      model: data.boat_model,
    },
  });
  return { UserDTO: { ...newUser, created: newUser.created instanceof Date ? newUser.created.toISOString() : newUser.created }, BoatDTO: boat };
}

async function getUserByUsername(username: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  return user ? { ...user, created: user.created instanceof Date ? user.created.toISOString() : user.created } : null;
}

async function updateUser(userId: number, data: UpdateUserDTO): Promise<UserDTO | null> {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: data.email, password: data.password },
    });
    return updatedUser ? { ...updatedUser, created: updatedUser.created instanceof Date ? updatedUser.created.toISOString() : updatedUser.created } : null;
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
  getUserByUsername,
};

export { UserService };
