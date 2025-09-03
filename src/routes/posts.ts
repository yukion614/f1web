import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
import { prisma } from "../utils/prisma-only.js";
import { Prisma, PrismaClient } from "@prisma/client";
import { success } from "zod";
import { jwtParseMiddleware, requireAuth } from "../middleware/jwt.js";

const router: Router = express.Router();

router.use(jwtParseMiddleware);
//發文(個人)
router.post("/:authorId/posts", async (req: Request, res: Response) => {
  const authorId = req.params.authorId;
  const { title, content } = req.body;

  // 將解析後的用戶資訊掛載到 req 和 res.locals
  // req.user = decoded;
  // res.locals.user = decoded;
  if (!res.locals.isAuthenticated) {
    return res.status(400).json({ success: false, message: "未登入帳戶" });
  }
  if (!authorId) {
    return res.status(400).json({ success: false, message: "id錯誤" });
  }
  try {
    const result = await prisma.post.create({
      data: {
        title: title,
        content: content,
        authorId: parseInt(authorId),
      },
    });
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
//修改 個人
router.put("/posts/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const { title, content, authorId } = req.body;
  if (!postId) return res.status(400).json({ message: "沒有post_id" });
  try {
    const result = await prisma.post.update({
      where: {
        id: parseInt(postId),
      },
      data: {
        title: title,
        content: content,
        authorId: authorId,
      },
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

//刪除post
router.delete("/delete/:postId", async (req: Request, res: Response) => {
  const postId = req.params.postId;
  if (!postId) return res.status(400).json({ message: "沒有post_id" });
  try {
    const result = await prisma.post.update({
      where: {
        id: parseInt(postId),
      },
      data: { status: 0 },
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

export default router;
