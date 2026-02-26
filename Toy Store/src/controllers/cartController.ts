import { Request, Response } from "express";
import session from "express-session";

interface CartItem {
  productId: number;
  quantity: number;
  attributes?: Record<string, string>;
}

interface CustomSession extends session.Session {
  cart?: CartItem[];
  customerId?: number;
}

export function getCart(req: Request, res: Response) {
  const s = req.session as CustomSession;
  if (!s.cart) s.cart = [];
  res.json(s.cart);
}

export function addToCart(req: Request, res: Response) {
  const s = req.session as CustomSession;
  const { productId, quantity, attributes } = req.body;
  if (!s.cart) s.cart = [];

  const existing = s.cart.find(
    (i) => i.productId === Number(productId) &&
    JSON.stringify(i.attributes) === JSON.stringify(attributes)
  );

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    s.cart.push({ productId: Number(productId), quantity: Number(quantity), attributes });
  }

  res.json({ message: "Added to cart", cart: s.cart });
}

export function updateCartItem(req: Request, res: Response) {
  const s = req.session as CustomSession;
  const productId = Number(req.params.id);
  const { quantity } = req.body;

  if (!s.cart) return res.json({ message: "Cart is empty" });

  const item = s.cart.find((i) => i.productId === productId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.quantity = Number(quantity);
  if (item.quantity <= 0) {
    s.cart = s.cart.filter((i) => i.productId !== productId);
  }

  res.json({ message: "Cart updated", cart: s.cart });
}

export function removeFromCart(req: Request, res: Response) {
  const s = req.session as any;
  const productId = Number(req.params.id);
  if (!s.cart) return res.json({ message: "Cart is empty" });
  s.cart = s.cart.filter((item: any) => item.productId !== productId);
  res.json({ message: "Item removed", cart: s.cart });
}

export function clearCart(req: Request, res: Response) {
  const s = req.session as CustomSession;
  s.cart = [];
  res.json({ message: "Cart cleared" });
}
