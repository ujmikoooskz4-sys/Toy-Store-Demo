import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "../../data/orders.json");

export function getAllOrders() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

export function saveOrders(orders: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
}
