"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateOrderRequest;
function validateOrderRequest(req, res, next) {
    const userId = req.body.userId;
    const stockSymbol = req.body.stockSymbol;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const stockType = req.body;
    if (!userId || !stockSymbol || !quantity || !price || !stockType) {
        res.status(400).json({ message: "Missing required fields." });
        return;
    }
    if (typeof quantity !== "number" ||
        quantity <= 0 ||
        typeof price !== "number" ||
        price <= 0) {
        res
            .status(400)
            .json({ message: "Quantity and price must be positive numbers." });
        return;
    }
    next();
}
