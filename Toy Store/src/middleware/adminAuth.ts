import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;

  if (!session.adminLoggedIn) {
    return res.redirect("/admin/login.html");
  }

  next();
}