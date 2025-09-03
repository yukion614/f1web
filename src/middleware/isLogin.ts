import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import type { JwtPayload } from "../interfaces/jwt.js";

const JWT_SECRET = process.env.JWT_SECRET || "xxxx";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "24h";

export const isLogin = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers["authorization"];
  if (authorization && authorization.startsWith("Bearer")) {
    const token = authorization.substring(7);

    const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;
  }
};
