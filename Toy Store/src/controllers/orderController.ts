import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const ordersFile = path.join(process.cwd(), "data/orders.json");
const productsFile = path.join(process.cwd(), "data/products.json");

/* ================= SAFE FILE READER ================= */

function readJSON(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data || "[]");
}

/* ================= CREATE ORDER ================= */

/* ================= CREATE ORDER ================= */

export function createOrder(req: Request, res: Response) {
  try {
    const { name, address, phone, payment } = req.body;

    const session = req.session as any;
    const cart = session.cart || [];

    if (!name || !address || !phone || !payment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const products = readJSON(productsFile);
    const orders = readJSON(ordersFile);

    let totalAmount = 0;

    const orderItems = cart.map((item: any) => {
      const product = products.find((p: any) => p.id == item.productId);

      const price = product?.price || 0;
      const quantity = Number(item.quantity);

      totalAmount += price * quantity;

      return {
        productId: item.productId,
        productName: product?.name || "Unknown Product",
        quantity,
        price
      };
    });

    const newOrder = {
      id: Date.now(),
      name,
      address,
      phone,
      payment,              // ✅ ADDED
      items: orderItems,
      total: totalAmount,
      status: "Pending",
      date: new Date().toLocaleString()
    };

    orders.push(newOrder);

    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    session.cart = [];

    res.json({
      message: "Order created successfully",
      orderId: newOrder.id
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error creating order" });
  }
}
/* ================= GET ORDERS ================= */

export function getOrders(req: Request, res: Response) {
  try {
    const orders = readJSON(ordersFile);
    res.json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= DELETE ORDER ================= */

export function deleteOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const orders = readJSON(ordersFile);
    const updatedOrders = orders.filter((order: any) => order.id != id);

    fs.writeFileSync(ordersFile, JSON.stringify(updatedOrders, null, 2));

    res.json({ message: "Order deleted" });

  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= UPDATE STATUS ================= */

export function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orders = readJSON(ordersFile);

    const order = orders.find((o: any) => o.id == id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.json({ message: "Status updated successfully" });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}