import express from "express"
import type { JwtPayload, loginSuccessResponse } from "../interfaces/index.js";
import type { User } from "../generated/prisma/index.js";
import "dotenv"
import {generateToken} from "../utils/generateToken.js"
const router = express();

const CLIENT_ID = process.env.CLIENT_ID
const REDIRECT_URI = process.env.REDIRECT_URI
const CLIENT_SECRET = process.env.CLIENT_SECRET
const secret = process.env.JWT_SECRET || "dfghjklfkdoermkoe";
const expires = process.env.JWT_EXPIRES || "24h";
// 首頁：登入按鈕
router.get("/", (req, res) => {
  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    "&response_type=code" +
    "&scope=openid%20email%20profile" +
    "&access_type=offline";
    // res.send(`<a href="${url}">使用 Google 登入</a>`);
    //   res.redirect(`<a href="${url}">使用 Google 登入</a>`);
    res.send({ url })
});

// Google 回調
router.get("/callback", async (req, res) => {
  const code = req.query.code;

    try{
        // 用 code(授權碼) 轉換成 token 向https://oauth2.googleapis.com/token 拿取
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
            code,
            client_id: CLIENT_ID,//用戶id
            client_secret: CLIENT_SECRET, //金鑰匙
            redirect_uri: REDIRECT_URI, //重新導向的頁面
            grant_type: "authorization_code",
            }),
        })

        const tokenData = await tokenRes.json()
        const userData =  await getGoogleUserInfo(tokenData.access_token)
        userData.provider = "google"
        console.log(userData)
        const token = generateToken(userData,secret,expires)
        // res.json(token)
        res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`)
       
    }catch(err){
        res.status(500).send("Token 換取失敗");
    }

})

//拿token 跟goole 拿使用者資料
async function getGoogleUserInfo(access_token) {

    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
        "Authorization": `Bearer ${access_token}`
        }
    });
    const data = await res.json();
    return data; // 包含 email、name、picture 等
}






export default router;
