import express from "express";
import handlers from "../controller/userController";
import validateMiddelware from "../middleware/validate";

const v1_RoutesRoutes = express.Router();

// v1.5 Routes

// Reset all data
v1_RoutesRoutes.post("/reset", handlers.resetData);

// User routes
v1_RoutesRoutes.post("/user/create/:userId", handlers.createUser);
v1_RoutesRoutes.get("/balance/inr/:userId", handlers.getUserInrBalance); // Get INR balance of a user
v1_RoutesRoutes.get("/balance/stock/:userId", handlers.getUserStockBalance); // Get stock balances for a user

// INR balance top-up (onramp)
v1_RoutesRoutes.post("/onramp/inr", handlers.addBalance);

// Stock symbol routes
v1_RoutesRoutes.post(
  "/symbol/create/:stockSymbol",
  handlers.createStockSymbol
);

// Fetch balances
v1_RoutesRoutes.get("/balances/stock", handlers.getAllStockBalances); // All stock balances
v1_RoutesRoutes.get("/balances/inr", handlers.getAllInrBalances); // All INR balances

// Orderbook routes
v1_RoutesRoutes.get("/orderbook/:stockSymbol", handlers.getOrderBookBySymbol); // Specific symbol orderbook

// Trade routes
v1_RoutesRoutes.post(
  "/order/buy",
  validateMiddelware,
  handlers.placeBuyOrder
); // Place buy order
v1_RoutesRoutes.post(
  "/order/sell",
  validateMiddelware,
  handlers.placeSellOrder
); // Place sell order
v1_RoutesRoutes.post("/trade/mint", handlers.mintToken); // Mint tokens

export default v1_RoutesRoutes;
