import { z } from "zod";

export const loginSchema = z.object({
  email: z
    // .string({ message: "請輸入信箱" })
    .email({ message: "請輸入正確信箱格式" }),
  password: z
    .string({ message: "請輸入密碼" })
    .min(6, { message: "密碼不得少於六位數" }),
});
