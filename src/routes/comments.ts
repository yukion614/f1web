import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
import { prisma } from "../utils/prisma-only.js";
import { jwtParseMiddleware, requireAuth } from "../middleware/jwt.js";
import isP2003 from "../utils/isP2003.js";
import isP2025 from "../utils/isP2025.js";

const router: Router = express.Router();
//post->comment
//新增底下留言
router.post("/posts/:postId/comments", async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content, authorId } = req.body;
  if (!postId || !authorId)
    return res.status(400).json({ message: "缺少 postId 或 authorId" });
  try {
    const result = await prisma.comment.create({
      data: {
        content: content,
        postId: parseInt(postId),
        authorId: parseInt(authorId),
      },
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

//修改該post底下留言
router.put(
  "/posts/:postId/comments/:commentId",
  async (req: Request, res: Response) => {
    //commentId 唯一id
    const { postId, commentId } = req.params;
    const { content } = req.body;
    if (!postId || !commentId)
      return res.status(400).json({ message: "id 錯誤" });

    //先尋找有沒有該則留言
    try {
      const comment = await prisma.comment.findFirst({
        where: {
          id: parseInt(commentId),
          postId: parseInt(postId),
        },
      });

      if (!comment) return res.status(404).json({ message: "沒有該留言" });

      //更新
      await prisma.comment.update({
        where: {
          id: parseInt(commentId),
        },
        data: {
          content: content,
        },
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//刪除留言
router.delete("/delete/:commentId", async (req: Request, res: Response) => {
  const { commentId } = req.params;
  if (!commentId) return res.status(400).json({ message: "id 錯誤" });

  try {
    const comment = await prisma.comment.findFirst({
      where: {
        id: parseInt(commentId),
      },
    });
    if (!comment) return res.status(404).json({ message: "沒有該留言" });

    await prisma.comment.update({
      where: {
        id: parseInt(commentId),
      },
      data: {
        status: 0,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
