import { Request, Response } from "express";

export function adminLogin(req: any, res: Response) {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    req.session.isAdmin = true;
    return res.json({ message: "Login successful" });
  }

  res.status(401).json({ message: "Invalid credentials" });
}

export function adminLogout(req: any, res: Response) {
  req.session.isAdmin = false;
  res.json({ message: "Logged out" });
}