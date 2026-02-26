import express from "express";
import session from "express-session";
import path from "path";

import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import { requireAdmin } from "./middleware/adminAuth";

const app = express();
const PORT = 3000;

app.use(express.json());

/* =========================
   SESSION CONFIG
========================= */
app.use(
  session({
    secret: "toy-store-secret",
    resave: false,
    saveUninitialized: false,
  })
);

/* =========================
   STATIC FILES
========================= */

// Shared CSS
app.use("/css", express.static(path.join(process.cwd(), "public/css")));

// CLIENT
app.use(express.static(path.join(process.cwd(), "public/client")));

// ADMIN
app.use(
  "/admin",
  requireAdmin,
  express.static(path.join(process.cwd(), "public/admin"))
);

/* =========================
   API ROUTES
========================= */

// Customer APIs
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Admin APIs (protected)
app.use("/api/admin", requireAdmin, adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});