import type { Request, Response, NextFunction } from "express";
import { loginSchema } from "../utils/loginSchema.js";
import { z } from "zod";
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const result = loginSchema.parse({ email, password });
    next();
  } catch (err) {
    let details;
    if (err instanceof z.ZodError) {
      details = err.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
    }
    res.status(400).json({ success: false, error: details });
  }
};
