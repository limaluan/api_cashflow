import { Request, Response } from "express";
import { userRepository } from "../repositories/userRepository";
import { BadRequestError } from "../helpers/api-errors";

import bcrypt from "bcrypt";

export class UserController {
  async create(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const userExists = await userRepository.findOneBy({ email });

    if (userExists) throw new BadRequestError("Email já existe");

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashPassword,
    });

    await userRepository.save(newUser);

    const { password: _, ...user } = newUser;

    return res.status(201).json(user);
  }

  async get(req: Request, res: Response) {
    const ResponseUser = req.user;
    const { password: _, transactions: __, ...user } = ResponseUser;

    return res.json(user);
  }
}
