import express from "express";
import v1RoutesRouter from "./routes/v1_routes";
import v1_5_RoutesRouter from "./routes/v1.5_routes";

const app = express();

app.use(express.json());

app.use("/api/v1/", v1RoutesRouter);
app.use("/api/v1_5", v1_5_RoutesRouter);

export default app;
