const express = require("express");
const {
  createUser,
  onrampUser,
  resetData,
  createSymbol,
  showAllUser,
  showStockBalance,
  showInrBalance,
  showOrderbook,
  userInrBalance,
} = require("../controller/userController");
const routesRouter = express.Router();

routesRouter.post("/reset", resetData);
routesRouter.post("/user/create/:userId", createUser);
routesRouter.post("/onramp/inr", onrampUser);
routesRouter.post("/symbol/create/:stockSymbol", createSymbol);
routesRouter.get("/balances/stock", showStockBalance);
routesRouter.get("/balances/inr", showInrBalance);
routesRouter.post("/users", showAllUser);
routesRouter.get("/orderbook", showOrderbook);
routesRouter.get("/balance/inr/:userId", userInrBalance);
routesRouter.get("/balance/stock/:userId", userStockBalance);

module.exports = routesRouter;
