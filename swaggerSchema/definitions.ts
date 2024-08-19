export const definitions = {
  userDTO: {
    id: 1,
    email: "email@gmail.com",
    password: "password",
  },
  createUserDTO: {
    email: "email@gmail.com",
    password: "password",
  },
  updateUserDTO: {
    email: "email@gmail.com",
    password: "password",
  },
  getAllUserResponse: [{ $ref: "#/definitions/userDTO" }],
};
