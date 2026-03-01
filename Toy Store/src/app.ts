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
app.use(express.urlencoded({ extended: true}))

/* =========================
   SESSION CONFIG
========================= */
app.use(
  session({
    secret: "toy-store-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

/* =========================
   STATIC FILES
========================= */

// Shared CSS
app.use("/css", express.static(path.join(process.cwd(), "public/css")));

// CLIENT
app.use(express.static(path.join(process.cwd(), "public/client")));


app.use(
  "/admin",
  (req, res, next) => {
    if (
      req.path === "/login.html" ||
      req.path === "/login.js"
    ) {
      return next();
    }
    requireAdmin(req, res, next);
  },
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
app.use("/api/admin", adminRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});