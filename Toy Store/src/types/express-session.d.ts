import "express-session";

declare module "express-session" {
  interface SessionData {
    cart?: {
      productId: number;
      quantity: number;
      attributes?: Record<string, string>;
    }[];
  }
}
