import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "products.json");

function readData() {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getProducts(req: Request, res: Response) {
  try {
    const data = readData();
    const { category, search } = req.query;

    let products = data.products;

    if (category) {
      products = products.filter((p: any) => p.categoryId == Number(category));
    }

    if (search) {
      const q = (search as string).toLowerCase();
      products = products.filter((p: any) =>
        p.name.toLowerCase().includes(q)
      );
    }

    res.json({ categories: data.categories, products });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ message: "Failed to load products" });
  }
}

export function getProductById(req: Request, res: Response) {
  try {
    const data = readData();
    const id = Number(req.params.id);
    const product = data.products.find((p: any) => p.productId === id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export function createProduct(req: Request, res: Response) {
  try {
    const data = readData();
    const maxId = data.products.reduce((m: number, p: any) => Math.max(m, p.productId), 0);
    const newProduct = { ...req.body, productId: maxId + 1 };
    data.products.push(newProduct);
    writeData(data);
    res.json({ message: "Product created", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export function updateProduct(req: Request, res: Response) {
  try {
    const data = readData();
    const id = Number(req.params.id);
    const idx = data.products.findIndex((p: any) => p.productId === id);
    if (idx === -1) return res.status(404).json({ message: "Product not found" });
    data.products[idx] = { ...data.products[idx], ...req.body, productId: id };
    writeData(data);
    res.json({ message: "Product updated", product: data.products[idx] });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export function deleteProduct(req: Request, res: Response) {
  try {
    const data = readData();
    const id = Number(req.params.id);
    data.products = data.products.filter((p: any) => p.productId !== id);
    writeData(data);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export function getCategories(req: Request, res: Response) {
  try {
    const data = readData();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
