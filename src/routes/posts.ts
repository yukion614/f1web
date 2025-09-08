import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
// import { prisma } from "../utils/prisma-only.js";
import { prisma } from "../utils/prisma-pagination.js";
// import { Prisma, PrismaClient } from "@prisma/client";
// import { success } from "zod";
import { jwtParseMiddleware, requireAuth } from "../middleware/jwt.js";
import isP2003 from "../utils/isP2003.js";
import isP2025 from "../utils/isP2025.js";

const router: Router = express.Router();

router.use(jwtParseMiddleware);
// router.use(requireAuth);
//發文(個人)
router.post(
  "/create",
   jwtParseMiddleware,
  requireAuth,
  async (req: Request, res: Response) => {
    // const authorId = req.params.authorId;
    const { title, content ,authorId } = req.body;

    // if (!res.locals.isAuthenticated) {
    //   return res.status(400).json({ success: false, message: "未登入帳戶" });
    // }
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
      if (isP2003(err))
        return res
          .status(400)
          .json({ success: false, message: "authorId不存在" });
      return res.status(500).json(err);
    }
  }
);
//修改 個人
router.put(
  "/posts/:postId",
  requireAuth,
  async (req: Request, res: Response) => {
    const postId = parseInt(req.params.postId || "");
    const { title, content, authorId } = req.body;
    if (!postId) return res.status(400).json({ message: "沒有post_id" });
    try {
      const result = await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          title: title,
          content: content,
          authorId: parseInt(authorId),
        },
      });
      res.status(200).json(result);
    } catch (err) {
      if (isP2025(err))
        return res
          .status(400)
          .json({ success: false, message: "修改的欄位不存在" });
      res.status(400).json(err);
    }
  }
);

//刪除post 個人底下comment 沒修改
router.delete(
  "/delete/:postId",
  requireAuth,
  async (req: Request, res: Response) => {
    const postId = parseInt(req.params.postId || "");
    if (isNaN(postId)) return res.status(400).json({ message: "沒有post_id" });

    try {
      const post = await prisma.post.findFirst({
        where: { id: postId },
        select: { status: true },
      });
      if (post?.status === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Post 不存在或已被刪除" });
      }

      const result = await prisma.post.update({
        where: {
          id: postId,
        },
        data: { status: 0 },
      });
      res.status(200).json(result);
    } catch (err) {
      if (isP2025(err))
        return res
          .status(400)
          .json({ success: false, message: "修改的欄位不存在" });
      res.status(400).json(err);
    }
  }
);

//讀取所有的post 但有頁數
//?page=2&limit=10
router.get("/pagination", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    const [contacts, meta] = await prisma.post
      .paginate({
        where: { status: 1 },
        orderBy: [{ createdAt: "desc" }],
      })
      .withPages({
        page,
        limit,
      });
    res.status(200).json({ contacts, meta });
  } catch (err) {
    res.status(500).json({ message: "錯誤" });
  }
});

//讀取post 包含下面的comment
router.get("/:postId", async (req: Request, res: Response) => {
  const postId = parseInt(req.params.postId || "");
  if (isNaN(postId)) return res.status(400).json({ message: "沒有該文章" });
  try {
    const comment = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,

        comments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            updatedAt: true,
            authorId: true,
            author:{
              select:{
                // id:true,
                name:true,
                avatar:true
              }
            }
           
          },
        },
      },
    });
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
});

export default router;
