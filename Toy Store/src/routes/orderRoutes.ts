import express from "express";
import {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrderStatus
} from "../controllers/orderController";

const router = express.Router();

/* CREATE */
router.post("/", createOrder);

/* GET ALL */
router.get("/", getOrders);

/* DELETE */
router.delete("/:id", deleteOrder);

/* 🔥 UPDATE STATUS (IMPORTANT) */
router.put("/:id/status", updateOrderStatus);

export default router;