import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} from "../controllers/productController";
import { requireAdmin } from "../middleware/adminAuth";
import { adminLogin, adminLogout } from "../controllers/adminController";

const router = Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

// Protected admin product routes
router.get("/products/categories", requireAdmin, getCategories);
router.get("/products", requireAdmin, getProducts);
router.get("/products/:id", requireAdmin, getProductById);
router.post("/products", requireAdmin, createProduct);
router.put("/products/:id", requireAdmin, updateProduct);
router.delete("/products/:id", requireAdmin, deleteProduct);

export default router;