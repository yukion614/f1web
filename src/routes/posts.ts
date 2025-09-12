import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
// import { prisma } from "../utils/prisma-only.js";
import { prisma } from "../utils/prisma-pagination.js";
// import { Prisma, PrismaClient } from "@prisma/client";
// import { success } from "zod";
import { jwtParseMiddleware, requireAuth } from "../middleware/jwt.js";
import isP2003 from "../utils/isP2003.js";
import isP2025 from "../utils/isP2025.js";
import multer from "multer"
import path from "path";
import { includes, success } from "zod";

const router: Router = express.Router();

router.use(jwtParseMiddleware);
// router.use(requireAuth);

//
// 設定檔案儲存位置與檔名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "src/uploads/post-img")); // 上傳資料夾
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});


const upload = multer({ storage });




//留言區圖片存擋
router.post("/_img", upload.single("img"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "沒有上傳檔案" });
  }
  console.log('runnn')
  res.json({
    success: true,
    filename: req.file.filename,
    path: req.file.path,
  });
});


//發文(個人)
router.post(
  "/create",
   jwtParseMiddleware,
  requireAuth,
  async (req: Request, res: Response) => {
 
    const { title, content ,authorId } = req.body;
    console.log({ title, content ,authorId } )
    if (!authorId) {
      return res.status(400).json({ success: false, message: "id錯誤" });
    }
    try {
      const result = await prisma.post.create({
        data: {
          title: title,
          content: content,
          authorId: BigInt(authorId),
        },
      });
      return res.status(201).json({ success: true, message: "發文成功" });
    } catch (err) {
      if (isP2003(err))
        return res
          .status(400)
          .json({ success: false, message: "authorId不存在" });
      return res.status(500).json({success:false,message:err});
    }
  }
);
//修改 個人
router.put(
  "/posts/:postId",
  jwtParseMiddleware,
  requireAuth,
  async (req: Request, res: Response) => {
    const postId = parseInt(req.params.postId || "");
    console.log(req.user)
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
      res.status(200).json({success:true,message:"資料更新成功！！"});
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
        include:{
          author:{
            select:{
              avatar:true,
              name:true,
              id:true
            }
          },
          comments:true
        }
      })
      .withPages({
        page,
        limit,
      });
    res.status(200).json({ contacts, meta });
  } catch (err) {
    res.status(500).json({ message: err });
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
        author:{
          select:{
            avatar:true
          }
        },

        comments: {
          where:{status:1},
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

//like post
router.post("/:postId/:userId",async (req,res)=>{
  const { postId , userId } = req.params
  //UserLikePost
  try{
    //查看有無按過喜歡
    const exsitLike = await prisma.userLikePost.findUnique({
      where:{
        userId_postId:{
          userId:BigInt(userId) ,
          postId:Number(postId)
        }
      }
    })
    if(exsitLike){
      return res.json({success:false,message:"已經按過了"})
    }else{
        //加進對比表
        await prisma.userLikePost.create({
          data:{
            userId:BigInt(userId) ,
            postId:Number(postId)
          }
        })
        //likeCount++
        await prisma.post.update({
          where:{
            id: Number(postId)
          },
          data:{
            likeCount:{increment:1}
          }
        })
      return res.json({success:true,message:"送出喜歡"})
    }
  }catch(err){
    console.log(err)
    res.status(500).json({success:false, message: "伺服器錯誤" });
  }
})



export default router;
