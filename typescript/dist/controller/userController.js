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
exports.placeSellOrder = exports.placeBuyOrder = exports.mintToken = exports.userStockBalance = exports.userInrBalance = exports.showOrderBookSymbol = exports.showAllUser = exports.inrBalance = exports.stockBalance = exports.newSymbol = exports.addBalance = exports.createUser = exports.resetData = void 0;
const userService_1 = __importDefault(require("../services/userService"));
// Controller for reset data
const resetData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService_1.default.resetDataService();
    res.status(result.status).json(result.data);
    return;
});
exports.resetData = resetData;
// Controller for creating a user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const result = yield userService_1.default.createUserService(userId);
    res.status(result.status).json(result.data);
    return;
});
exports.createUser = createUser;
// Controller for adding balance
const addBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = req.body;
    const result = yield userService_1.default.addBalanceService(userId, amount);
    res.status(result.status).json(result.data);
    return;
});
exports.addBalance = addBalance;
// Controller for creating a new stock symbol
const newSymbol = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.stockSymbol;
    const userId = req.body.userId;
    const result = yield userService_1.default.newSymbolService(userId, stockSymbol);
    res.status(result.status).json(result.data);
    return;
});
exports.newSymbol = newSymbol;
// Controller for fetching stock balances
const stockBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService_1.default.stockBalanceService();
    res.status(result.status).json(result.data);
    return;
});
exports.stockBalance = stockBalance;
// Controller for fetching INR balances
const inrBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService_1.default.inrBalanceService();
    res.status(result.status).json(result.data);
    return;
});
exports.inrBalance = inrBalance;
// Controller for showing all users
const showAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService_1.default.showAllUserService();
    res.status(result.status).json(result.data);
    return;
});
exports.showAllUser = showAllUser;
// Controller for showing order book by stock symbol
const showOrderBookSymbol = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.stockSymbol;
    const result = yield userService_1.default.showOrderBookSymbolService(stockSymbol);
    res.status(result.status).json(result.data);
    return;
});
exports.showOrderBookSymbol = showOrderBookSymbol;
// Controller for getting a user's INR balance
const userInrBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const result = yield userService_1.default.userInrBalanceService(userId);
    if (!result) {
        // Handle the case where the service did not return a result
        res.status(500).json({ message: "An unexpected error occurred" });
        return;
    }
    res.status(result.status).json(result.data);
    return;
});
exports.userInrBalance = userInrBalance;
// Controller for getting a user's stock balance
const userStockBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const result = yield userService_1.default.userStockBalanceService(userId);
    if (!result) {
        // Handle the case where the service did not return a result
        res.status(500).json({ message: "An unexpected error occurred" });
        return;
    }
    res.status(result.status).json(result.data);
    return;
});
exports.userStockBalance = userStockBalance;
// Controller for minting tokens
const mintToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, stockSymbol, quantity } = req.body;
    const result = yield userService_1.default.mintTokenService(userId, stockSymbol, quantity);
    res.status(result.status).json(result.data);
    return;
});
exports.mintToken = mintToken;
// Controller for placing a buy order
const placeBuyOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, stockSymbol, quantity, price, stockType } = req.body;
    const result = yield userService_1.default.placeBuyOrderService(userId, stockSymbol, quantity, price, stockType);
    if (!result) {
        // Handle the case where the service did not return a result
        res.status(500).json({ message: "An unexpected error occurred" });
        return;
    }
    res.status(result.status).json(result.data);
    return;
});
exports.placeBuyOrder = placeBuyOrder;
// Controller for placing a sell order
const placeSellOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, stockSymbol, quantity, price, stockType } = req.body;
    const result = yield userService_1.default.placeSellOrderService(userId, stockSymbol, quantity, price, stockType);
    if (!result) {
        // Handle the case where the service did not return a result
        res.status(500).json({ message: "An unexpected error occurred" });
        return;
    }
    res.status(result.status).json(result.data);
    return;
});
exports.placeSellOrder = placeSellOrder;
// Export all controllers
exports.default = {
    resetData: exports.resetData,
    createUser: exports.createUser,
    addBalance: exports.addBalance,
    newSymbol: exports.newSymbol,
    stockBalance: exports.stockBalance,
    inrBalance: exports.inrBalance,
    showAllUser: exports.showAllUser,
    showOrderBookSymbol: exports.showOrderBookSymbol,
    userInrBalance: exports.userInrBalance,
    userStockBalance: exports.userStockBalance,
    mintToken: exports.mintToken,
    placeBuyOrder: exports.placeBuyOrder,
    placeSellOrder: exports.placeSellOrder,
};
