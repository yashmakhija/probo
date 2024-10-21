import express from "express";

import handlers from "../controller/userController";
import validateMiddelware from "../middleware/validate";

const v1_RoutesRouter = express.Router();

v1_RoutesRouter.post("/reset", handlers.resetData);
v1_RoutesRouter.post("/user/create/:userId", handlers.createUser);
v1_RoutesRouter.post("/onramp/inr", handlers.addBalance);
v1_RoutesRouter.post("/symbol/create/:stockSymbol", handlers.newSymbol);
v1_RoutesRouter.get("/balances/stock", handlers.stockBalance);
v1_RoutesRouter.get("/balances/inr", handlers.inrBalance);
v1_RoutesRouter.post("/users", handlers.showAllUser);
v1_RoutesRouter.get("/orderbook/:stockSymbol", handlers.showOrderBookSymbol);
v1_RoutesRouter.get("/balance/inr/:userId", handlers.userInrBalance);
v1_RoutesRouter.get("/balance/stock/:userId", handlers.userStockBalance);
v1_RoutesRouter.post("/order/buy", validateMiddelware, handlers.placeBuyOrder);
v1_RoutesRouter.post("/order/sell", validateMiddelware, handlers.placeSellOrder);
v1_RoutesRouter.post("/trade/mint", handlers.mintToken);

export default v1_RoutesRouter;
