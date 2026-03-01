import { Request, Response } from "express";

export function adminLogin(req: any, res: Response) {

  const { username, password } = req.body;

  if (username === "admin" && password === "123456") {
    req.session.user = { 
      id: 0,
      name: "Admin",
      role: "admin"
    };

    return res.json({ message: "Login successful" });
  }

  res.status(401).json({ message: "Invalid credentials" });
}

export function adminLogout(req: any, res: Response) {
  req.session.destroy(() => {
     res.json({ message: "Logged out" });
  });
}