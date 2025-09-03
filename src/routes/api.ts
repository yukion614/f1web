import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
import { prisma } from "../utils/prisma-only.js";
import { Prisma, PrismaClient } from "@prisma/client";
import { loginSchema } from "../utils/loginSchema.js";
// import { validate } from "uuid";
// import { jwt, success } from "zod";
import bcrypt from "bcryptjs";
// import type { JwtPayload } from "jsonwebtoken";
import type { JwtPayload } from "../interfaces/jwt.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js";

const router: Router = express.Router();

router.post("/jwt-login", async (req: Request, res: Response) => {
  const validateData = loginSchema.parse(req.body);
  const { email, password } = validateData;
  const JWT_SECRET = process.env.JWT_SECRET!;

  const JWT_EXPIRES = process.env.JWT_EXPIRES!;
  try {
    //找到該帳戶所有資訊
    const member = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    //找不到信箱
    if (!member) {
      return res.status(401).json({
        success: false,
        erroe: "帳號密碼錯誤",
      });
    }

    const isPasswordVaild = await bcrypt.compare(password, member.password);
    //密碼不正確
    if (!isPasswordVaild) {
      return res.status(401).json({
        success: false,
        erroe: "帳號密碼錯誤",
      });
    }

    //建立jwt payload
    const payload: JwtPayload = {
      member_id: member.id,
      email: member.email,
    };
    //生成jwt token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    } as jwt.SignOptions);
  } catch (err) {}
});

export default router;
