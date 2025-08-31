import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
import { prisma } from "../utils/prisma-only.js";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

const router: Router = express.Router();

//新增對話留言
router.post("/add", async (req: Request, res: Response) => {
  const { content, authorId } = req.body;
  if (!authorId) return res.status(400).json({ message: "使用者帳號錯誤" });
  if (!content || content.trim().length === 0)
    return res.status(400).json({ message: "內容為空" });

  try {
    const result = await prisma.message.create({
      data: {
        content: content,
        authorId: Number(authorId),
      },
    });
    res.status(200).json({ message: "更新成功" });
  } catch (err) {
    console.log(err);

    res.status(400).json({ message: "錯誤訊息" });
  }
});

//讀取對話訊息
router.get("/get_all_messages", async (req: Request, res: Response) => {
  const result = await prisma.message.findMany({
    where: {
      status: 1,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  console.log(result);

  res.status(200).json({ result });
});

//隱藏收回對話
router.post("/remove_messages", async (req: Request, res: Response) => {
  const { authorId, messageId } = req.body;
  console.log({ authorId, messageId });

  try {
    const result = await prisma.message.update({
      where: {
        id: Number(messageId), //訊息的id
        authorId: Number(authorId), //使用者的id
      },
      data: { status: 0 },
    });
    res.status(200).json({ message: "刪除成功" });
  } catch (err) {
    console.log(err);
  }
});

export default router;
