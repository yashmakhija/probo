const express = require("express");
const {
  createUser,
  onrampUser,
  resetData,
  createSymbol,
  showAllUser,
  showStockBalance,
  showInrBalance,
  userInrBalance,
  userStockBalance,
  showOrderbookBySymbol,
  placeBuyOrder,
  placeSellOrder,
  mintTokens,
  cancelOrder,
} = require("../controller/userController");

const validwateMiddelware = require("../middleware/index");

const routesRouter = express.Router();

routesRouter.post("/reset", resetData);
routesRouter.post("/user/create/:userId", createUser);
routesRouter.post("/onramp/inr", onrampUser);
routesRouter.post("/symbol/create/:stockSymbol", createSymbol);
routesRouter.get("/balances/stock", showStockBalance);
routesRouter.get("/balances/inr", showInrBalance);
routesRouter.post("/users", showAllUser);
routesRouter.get("/orderbook/:stockSymbol", showOrderbookBySymbol);
routesRouter.get("/balance/inr/:userId", userInrBalance);
routesRouter.get("/balance/stock/:userId", userStockBalance);
routesRouter.post("/order/buy", validwateMiddelware, placeBuyOrder);
routesRouter.post("/order/sell", validwateMiddelware, placeSellOrder);
routesRouter.post("/order/cancel", cancelOrder);
routesRouter.post("/trade/mint", mintTokens);

module.exports = routesRouter;
