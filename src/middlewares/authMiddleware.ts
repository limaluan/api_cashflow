import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../helpers/api-errors";
import { userRepository } from "../repositories/userRepository";

interface IJwtPayload {
  id: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) throw new UnauthorizedError("Não autorizado");

  const token = authorization.split(" ")[1];

  if (!token) throw new UnauthorizedError("Não autorizado");

  const { id } = jwt.verify(
    token,
    "24ed5677b7c48ea38848f44fffd45d13"
  ) as IJwtPayload;

  const user = await userRepository.findOneBy({ id });

  if (!user) throw new UnauthorizedError("Não autorizado");

  const { password: _, ...loggedUser } = user;

  req.user = loggedUser
  
  next();
};
