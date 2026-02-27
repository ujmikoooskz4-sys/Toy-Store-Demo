import { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login.html"); // send non-admin away
  }

  next();
}