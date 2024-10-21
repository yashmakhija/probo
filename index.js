const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const v1 = require("./v1");

const app = express();
app.use(express.json());

app.use("/api/v1", v1);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});

module.exports = app;
