import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

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

function broadcastMessage(message: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`Broadcast: ${message}`);
    }
  });
}

console.log("WebSocket server is running on ws://localhost:8080");

export default wss;
