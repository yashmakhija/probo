"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controller/userController"));
const validate_1 = __importDefault(require("../middleware/validate"));
const v1_5_RoutesRouter = express_1.default.Router();
// v1.5 Routes
// Reset all data
v1_5_RoutesRouter.post("/reset", userController_1.default.resetData);
// User routes
v1_5_RoutesRouter.post("/user/create/:userId", userController_1.default.createUser);
v1_5_RoutesRouter.get("/balance/inr/:userId", userController_1.default.getUserInrBalance); // Get INR balance of a user
v1_5_RoutesRouter.get("/balance/stock/:userId", userController_1.default.getUserStockBalance); // Get stock balances for a user
// INR balance top-up (onramp)
v1_5_RoutesRouter.post("/onramp/inr", userController_1.default.addBalance);
// Stock symbol routes
v1_5_RoutesRouter.post("/symbol/create/:stockSymbol", userController_1.default.createStockSymbol);
// Fetch balances
v1_5_RoutesRouter.get("/balances/stock", userController_1.default.getAllStockBalances); // All stock balances
v1_5_RoutesRouter.get("/balances/inr", userController_1.default.getAllInrBalances); // All INR balances
// Orderbook routes
v1_5_RoutesRouter.get("/orderbook/:stockSymbol", userController_1.default.getOrderBookBySymbol); // Specific symbol orderbook
// Trade routes
v1_5_RoutesRouter.post("/order/buy", validate_1.default, userController_1.default.placeBuyOrder); // Place buy order
v1_5_RoutesRouter.post("/order/sell", validate_1.default, userController_1.default.placeSellOrder); // Place sell order
v1_5_RoutesRouter.post("/trade/mint", userController_1.default.mintToken); // Mint tokens
exports.default = v1_5_RoutesRouter;
