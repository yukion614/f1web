import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
import { prisma } from "../utils/prisma-only.js";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

import isP2002 from "../utils/isP2002.js";

const router: Router = express.Router();

router.post("/create", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  //hash
  const saltRound = 10;
  const hash = bcrypt.hashSync(password, saltRound);
  try {
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hash,
      },
    });
    res.status(200).json(user);
  } catch (err: unknown) {
    // console.log(err);

    if (isP2002(err)) {
      return res.status(400).json({ error: "這email 已經有人使用了" });
    }

    res.status(400).json(err);
  }
});

export default router;
