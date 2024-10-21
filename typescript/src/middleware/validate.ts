import { Response, Request } from "express";

export default function validateOrderRequest(
  req: Request,
  res: Response,
  next: Function
) {
  const userId: string = req.body.userId;
  const stockSymbol: string = req.body.stockSymbol;
  const quantity: number = req.body.quantity;
  const price: number = req.body.price;
  const stockType: string = req.body;

  if (!userId || !stockSymbol || !quantity || !price || !stockType) {
    res.status(400).json({ message: "Missing required fields." });
    return;
  }
  if (
    typeof quantity !== "number" ||
    quantity <= 0 ||
    typeof price !== "number" ||
    price <= 0
  ) {
    res
      .status(400)
      .json({ message: "Quantity and price must be positive numbers." });
    return;
  }
  next();
}
