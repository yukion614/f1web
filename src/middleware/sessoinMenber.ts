import type { Request, Response, NextFunction } from "express";

export const sessionMenberMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req.session as any).member) {
    (req.session as any).member = {
      member_id: "",
      email: "",
      avatar: "",
      role: "",
      token: "",
    };
  }
  next();
};
