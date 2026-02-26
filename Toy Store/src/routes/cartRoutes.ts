import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController";

const router = express.Router();

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:id", removeFromCart);

export default router;
