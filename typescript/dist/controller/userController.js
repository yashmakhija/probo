"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintToken = exports.placeSellOrder = exports.placeBuyOrder = exports.getUserStockBalance = exports.getUserInrBalance = exports.getOrderBookBySymbol = exports.getOrderBook = exports.getAllInrBalances = exports.getAllStockBalances = exports.createStockSymbol = exports.addBalance = exports.createUser = exports.resetData = void 0;
const userService_1 = __importDefault(require("../services/userService"));
// Controller for resetting data
const resetData = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService_1.default.resetDataService();
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to reset data", error });
    }
});
exports.resetData = resetData;
// Controller for creating a user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const result = yield userService_1.default.createUserService(userId);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create user", error });
    }
});
exports.createUser = createUser;
// Controller for adding balance
const addBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = req.body;
    if (!userId || amount == null) {
        res.status(400).json({ message: "userId and amount are required" });
        return;
    }
    try {
        const result = yield userService_1.default.addBalanceService(userId, amount);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to add balance", error });
    }
});
exports.addBalance = addBalance;
// Controller for creating a new stock symbol
const createStockSymbol = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stockSymbol } = req.params;
    try {
        const result = yield userService_1.default.createStockSymbolService(stockSymbol);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create stock symbol", error });
    }
});
exports.createStockSymbol = createStockSymbol;
// Controller for fetching all stock balances
const getAllStockBalances = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService_1.default.getAllStockBalancesService();
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch stock balances", error });
    }
});
exports.getAllStockBalances = getAllStockBalances;
const getAllInrBalances = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService_1.default.getAllInrBalancesService();
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch stock balances", error });
    }
});
exports.getAllInrBalances = getAllInrBalances;
// Controller for fetching order book
const getOrderBook = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService_1.default.getOrderBookService();
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch order book", error });
    }
});
exports.getOrderBook = getOrderBook;
// Controller for fetching order book by stock symbol
const getOrderBookBySymbol = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stockSymbol } = req.params;
    try {
        const result = yield userService_1.default.getOrderBookBySymbolService(stockSymbol);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({
            message: `Failed to fetch order book for ${stockSymbol}`,
            error,
        });
    }
});
exports.getOrderBookBySymbol = getOrderBookBySymbol;
// Controller for fetching a user's INR balance
const getUserInrBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const result = yield userService_1.default.getUserBalanceService(userId);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch INR balance", error });
    }
});
exports.getUserInrBalance = getUserInrBalance;
// Controller for fetching a user's stock balance
const getUserStockBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const result = yield userService_1.default.getUserStockBalanceService(userId);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch stock balance", error });
    }
});
exports.getUserStockBalance = getUserStockBalance;
// Controller for placing a buy order
const placeBuyOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, stockSymbol, quantity, price, stockOption } = req.body;
    if (!userId || !stockSymbol || !quantity || !price || !stockOption) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }
    try {
        const result = yield userService_1.default.placeBuyOrderService(userId, stockSymbol, quantity, price, stockOption);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to place buy order", error });
    }
});
exports.placeBuyOrder = placeBuyOrder;
// Controller for placing a sell order
const placeSellOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, stockSymbol, quantity, price, stockOption } = req.body;
    if (!userId || !stockSymbol || !quantity || !price || !stockOption) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }
    try {
        const result = yield userService_1.default.placeSellOrderService(userId, stockSymbol, quantity, price, stockOption);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to place sell order", error });
    }
});
exports.placeSellOrder = placeSellOrder;
// Controller for minting tokens
const mintToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, stockSymbol, quantity } = req.body;
    if (!userId || !stockSymbol || quantity == null) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }
    try {
        const result = yield userService_1.default.mintTokenService(userId, stockSymbol, quantity);
        res.status(result.status).json(result.data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to mint tokens", error });
    }
});
exports.mintToken = mintToken;
// Export all controllers
exports.default = {
    resetData: exports.resetData,
    createUser: exports.createUser,
    addBalance: exports.addBalance,
    createStockSymbol: exports.createStockSymbol,
    getAllStockBalances: exports.getAllStockBalances,
    getOrderBook: exports.getOrderBook,
    getOrderBookBySymbol: exports.getOrderBookBySymbol,
    getUserInrBalance: exports.getUserInrBalance,
    getUserStockBalance: exports.getUserStockBalance,
    placeBuyOrder: exports.placeBuyOrder,
    placeSellOrder: exports.placeSellOrder,
    mintToken: exports.mintToken,
    getAllInrBalances: exports.getAllInrBalances,
};
