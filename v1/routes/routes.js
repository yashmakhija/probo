const express = require("express");
const { createUser } = require("../controller/createUser");
const { onrampUser } = require("../controller/onramp");
const { resetData } = require("../controller/resetData");


const routesRouter = express.Router();

routesRouter.post("/user/create/:userId", createUser);
routesRouter.post("/onramp/inr", onrampUser);
routesRouter.post("/reset", resetData);

module.exports = routesRouter;
