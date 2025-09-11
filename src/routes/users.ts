import express from "express";
import type { Request, Response, NextFunction, Router } from "express";
import { prisma } from "../utils/prisma-only.js";
import bcrypt from "bcryptjs";
// import { Prisma, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import isP2002 from "../utils/isP2002.js";
import "dotenv/config.js";
import type { JwtPayload, loginSuccessResponse } from "../interfaces/index.js";
import { success, z } from "zod";
import { tokenBlackList } from "../utils/tokenBlackList.js";
import "dotenv"
import multer from "multer";
import path from "path";
import type { User } from "../generated/prisma/index.js";
const router: Router = express.Router();

// 設定路徑
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "src/uploads/avatars")); // 存到專案根目錄的 src/uploads
  },
  filename: (req, file, cb) => {
    const uuid = crypto.randomUUID()
    const fileName = `${uuid}${file.originalname}`
    cb(null, fileName); // 保留原檔名
  },
});
//圖片上傳倉庫
const upload = multer({ storage });
//token 金鑰 時間
const secret = process.env.JWT_SECRET || "dfghjklfkdoermkoe";
const expires = process.env.JWT_EXPIRES || "24h";

function generateToken(existingUser:User,secret:string,expires:string){
  const payload: JwtPayload = {
    member_id: existingUser.id.toString(),
    email: existingUser.email,
    name: existingUser.name,
    avatar: existingUser.avatar?  `http://${process.env.HOST}:${process.env.PORT}${existingUser.avatar}` : null
  };
  const token = jwt.sign(payload, secret, {
    expiresIn: expires,
  } as jwt.SignOptions);
  return token
}



//註冊
router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  //hash
  const saltRound = 10;
  const hash = await bcrypt.hashSync(password, saltRound);
  try {
    //先判斷是否已經存在該email
    const existEmail = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (existEmail) return res.status(400).json({ message: "該用戶已經存在" });
    //不存在生成帳戶
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hash,
      },
    });
    // res.status(200).json(user);
    res.status(200).json({
      success:true,
      message:"註冊成功！！"
    });
  } catch (err: unknown) {
    if (isP2002(err)) {
      return res.status(400).json({ error: "這email 已經有人使用了" });
    }

    res.status(400).json(err);
  }
});

//login
//=> /api/users/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    //看看該帳戶是否存在
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        // password: password,
      },
    });

    if (!existingUser) return res.status(400).json({ message: "該用戶不存在" });

    // password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return res.status(400).json({ message: "帳號密碼錯誤" });
    const token = generateToken(existingUser,secret,expires)
    //建立回應資訊
    const response: loginSuccessResponse = {
      success: true,
      data: {
        member: {
          id: existingUser.id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          avatar: existingUser.avatar,
          role: existingUser.role,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
        token: token,
        message:"登入成功！！"
      },
    };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "資料驗證失敗",
        details: err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      error: "伺服器錯誤",
    });
  }
});

//logout
// const tokenBlackList: string[] = [];
router.delete("/logout", async (req: Request, res: Response) => {
  // 黑名單
  const token = req.headers.authorization?.substring(7);
  if (token) tokenBlackList.push(token);

  res.status(200).json({ success: true, message: "已登出" });
});


//上傳avatar
router.patch("/:id/avatar", upload.single("avatar"),async (req,res)=>{
   const id = BigInt(req.params.id) 
  //  console.log(req.file) 
  const avatarImg =  req.file.filename
  // console.log('avatarImg',avatarImg)
  // const date = new Date()
  const url =  `/uploads/avatars/${avatarImg}`
  try{
      const result = await prisma.user.update({
      where:{
        id:id
      },
      data:{
        avatar: url
      }
    })
   

    const existingUser = await prisma.user.findFirst({
      where: { id: id,},
    });

    const token = generateToken(existingUser,secret,expires)

    res.json({success:true, message: "上傳成功", token: token });
  }catch(err){
    console.log(err)
  }

})


export default router;
