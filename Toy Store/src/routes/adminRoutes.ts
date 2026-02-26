import { Router } from "express";
import fs from "fs";
import path from "path";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from "../controllers/productController";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();
const adminFile = path.join(process.cwd(), "data/admin.json");

// Login (public)
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = JSON.parse(fs.readFileSync(adminFile, "utf-8"));

  if (username.trim() === admin.username && password.trim() === admin.password) {
    (req.session as any).adminLoggedIn = true;
    return res.json({ success: true });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

router.post("/logout", (req, res) => {
  (req.session as any).adminLoggedIn = false;
  res.json({ message: "Logged out" });
});

// Protected admin product routes
router.get("/products/categories", requireAdmin, getCategories);
router.get("/products", requireAdmin, getProducts);
router.get("/products/:id", requireAdmin, getProductById);
router.post("/products", requireAdmin, createProduct);
router.put("/products/:id", requireAdmin, updateProduct);
router.delete("/products/:id", requireAdmin, deleteProduct);

export default router;
