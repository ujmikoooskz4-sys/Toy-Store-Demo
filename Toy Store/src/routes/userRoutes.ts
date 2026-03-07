import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const usersFile = path.join(process.cwd(), "data/user.json");

router.get("/", (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  res.json(users);
});

router.post("/select", (req: any, res) => {
  const { userId } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

  const user = users.find((u: any) => u.id === Number(userId));
  if (!user) return res.status(404).json({ message: "User not found" });

  req.session.user = {   // before --> req.session.customerId = user.id;
    id: user.id,          // req.session.customerName = user.name; 
    name: user.name,
    role: "user"
  };

  res.json({ message: "User selected", user });
});

router.get("/me", (req: any, res) => {
  if (!req.session.customerId) {
    return res.json({ loggedIn: false });
  }
  res.json({ loggedIn: true, userId: req.session.customerId, name: req.session.customerName });
});

router.post("/logout", (req: any, res) => {
  req.session.customerId = null;
  req.session.customerName = null;
  res.json({ message: "Logged out" });
});

export default router;
