import app from "./app";
import wss from "./websocket/wsServer";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
