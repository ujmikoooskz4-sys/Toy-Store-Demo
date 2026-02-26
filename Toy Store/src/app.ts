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
app.use(
  session({
    secret: "toy-store-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Shared CSS (accessible at /css/theme.css from all pages)
app.use("/css", express.static(path.join(process.cwd(), "public/css")));

// Client public
app.use(express.static(path.join(process.cwd(), "public/client")));

// Protect admin pages
app.use(
  "/admin",
  (req, res, next) => {
    if (req.path === "/login.html" || req.path === "/login.js") return next();
    requireAdmin(req, res, next);
  },
  express.static(path.join(process.cwd(), "public/admin"))
);

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
