function validateOrderRequest(req, res, next) {
  const { userId, stockSymbol, quantity, price, stockType } = req.body;
  if (!userId || !stockSymbol || !quantity || !price || !stockType) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  if (
    typeof quantity !== "number" ||
    quantity <= 0 ||
    typeof price !== "number" ||
    price <= 0
  ) {
    return res
      .status(400)
      .json({ message: "Quantity and price must be positive numbers." });
  }
  next();
}

module.exports = validateOrderRequest;
