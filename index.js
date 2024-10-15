const express = require("express");
const v1 = require("./v1");

const app = express();
app.use(express.json());

app.use("/", v1);

const PORT = 3000;
app.listen(PORT, () => {});

module.exports = { app };
