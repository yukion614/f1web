import type { JwtPayload, loginSuccessResponse } from "../interfaces/index.js";
import type { User } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
export function generateToken(existingUser:User,secret:string,expires:string){
  console.log(existingUser)
  const rawPic = existingUser.avatar || existingUser.picture
  // const avatar = rawPic ?  rawPic.startsWith("http") ? rawPic : `http://${process.env.HOST}:${process.env.PORT}${rawPic}` : null
  const avatar = rawPic ?  rawPic.startsWith("http") ? rawPic : `${process.env.BACKEND_URL}${rawPic}` : null
  
  const payload: JwtPayload = {
    member_id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    avatar: avatar,
    provider:existingUser.provider

  };
  const token = jwt.sign(payload, secret, {
    expiresIn: expires,
  } as jwt.SignOptions);
  return token
}
