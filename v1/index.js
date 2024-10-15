const express = require("express");
const routesRouter = require("./routes/routes");

const v1 = express.Router();

v1.use("/", routesRouter);
module.exports = v1;
