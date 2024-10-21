"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const v1_routes_1 = __importDefault(require("./routes/v1_routes"));
const v1_5_routes_1 = __importDefault(require("./routes/v1.5_routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/v1/", v1_routes_1.default);
app.use("/api/v1_5", v1_5_routes_1.default);
exports.default = app;
