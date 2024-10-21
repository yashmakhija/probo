"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controller/userController"));
const validate_1 = __importDefault(require("../middleware/validate"));
const v1_RoutesRouter = express_1.default.Router();
v1_RoutesRouter.post("/reset", userController_1.default.resetData);
v1_RoutesRouter.post("/user/create/:userId", userController_1.default.createUser);
v1_RoutesRouter.post("/onramp/inr", userController_1.default.addBalance);
v1_RoutesRouter.post("/symbol/create/:stockSymbol", userController_1.default.newSymbol);
v1_RoutesRouter.get("/balances/stock", userController_1.default.stockBalance);
v1_RoutesRouter.get("/balances/inr", userController_1.default.inrBalance);
v1_RoutesRouter.post("/users", userController_1.default.showAllUser);
v1_RoutesRouter.get("/orderbook/:stockSymbol", userController_1.default.showOrderBookSymbol);
v1_RoutesRouter.get("/balance/inr/:userId", userController_1.default.userInrBalance);
v1_RoutesRouter.get("/balance/stock/:userId", userController_1.default.userStockBalance);
v1_RoutesRouter.post("/order/buy", validate_1.default, userController_1.default.placeBuyOrder);
v1_RoutesRouter.post("/order/sell", validate_1.default, userController_1.default.placeSellOrder);
v1_RoutesRouter.post("/trade/mint", userController_1.default.mintToken);
exports.default = v1_RoutesRouter;