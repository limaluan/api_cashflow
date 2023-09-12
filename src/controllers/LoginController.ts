import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { userRepository } from "../repositories/userRepository";
import { UnauthorizedError } from "../helpers/api-errors";

import jwt from "jsonwebtoken";

export class LoginController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await userRepository.findOneBy({ email });

    if (!user) throw new UnauthorizedError("Email ou senha inválidos");

    const verifyPass = await bcrypt.compare(password, user.password);

    if (!verifyPass) throw new UnauthorizedError("Email ou senha inválidos");

    const token = jwt.sign(
      { id: user.id },
      "24ed5677b7c48ea38848f44fffd45d13",
      { expiresIn: "8h" }
    );

    const { password: _, ...userLogin } = user;

    return res.json({
      user: userLogin,
      token,
    });
  }
}
