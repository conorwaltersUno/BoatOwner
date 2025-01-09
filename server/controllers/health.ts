import { Request, Response } from "express";

const okStatus = 200;
const internalServerError = 500;

export default async function health(req: Request, res: Response) {
  try {
    return res.sendStatus(okStatus);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}
