"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on("connection", (ws) => {
    console.log(`Client connected via WebSocket`);
    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        ws.send(`Echo: ${message}`);
        broadcastMessage(message.toString());
    });
    ws.on("close", () => {
        console.log("Client disconnected");
    });
    ws.on("error", (error) => {
        console.error(`WebSocket error: ${error}`);
    });
});
function broadcastMessage(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(`Broadcast: ${message}`);
        }
    });
}
console.log("WebSocket server is running on ws://localhost:8080");
exports.default = wss;
