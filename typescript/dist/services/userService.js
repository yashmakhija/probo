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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDataService = exports.placeSellOrderService = exports.placeBuyOrderService = exports.mintTokenService = exports.getUserStockBalanceService = exports.getUserBalanceService = exports.getOrderBookService = exports.getOrderBookBySymbolService = exports.getAllInrBalancesService = exports.getAllStockBalancesService = exports.createStockSymbolService = exports.addBalanceService = exports.createUserService = void 0;
const redis_1 = require("redis");
// In-memory storage
let INR_BALANCES = {};
let STOCK_BALANCES = {};
let ORDERBOOK = {};
// Redis client setup
const client = (0, redis_1.createClient)();
client.on("error", (err) => console.error("Redis Client Error:", err));
client.connect().catch(console.error);
// Utility to push data to Redis queue
const pushToQueue = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.lPush(key, JSON.stringify(data));
        console.log(`Data pushed to Redis queue: ${key}`);
    }
    catch (error) {
        console.error("Error pushing to Redis queue:", error);
    }
});
// Service: Create User
const createUserService = (userId) => {
    if (INR_BALANCES[userId]) {
        return { status: 400, data: { message: "User already exists" } };
    }
    INR_BALANCES[userId] = { balance: 0, locked: 0 };
    pushToQueue("user_creation_queue", { userId, balance: INR_BALANCES[userId] });
    return { status: 201, data: { message: "User created" } };
};
exports.createUserService = createUserService;
// Service: Add Balance
const addBalanceService = (userId, amount) => {
    const user = INR_BALANCES[userId];
    if (!user) {
        return { status: 404, data: { message: "User not found" } };
    }
    user.balance += amount;
    pushToQueue("balance_update_queue", { userId, balance: user });
    return { status: 200, data: { message: `Added ${amount} to ${userId}` } };
};
exports.addBalanceService = addBalanceService;
// Service: Create Stock Symbol
const createStockSymbolService = (stockSymbol) => {
    if (ORDERBOOK[stockSymbol]) {
        return { status: 400, data: { message: "Stock symbol already exists" } };
    }
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    pushToQueue("stock_creation_queue", { stockSymbol });
    return { status: 201, data: { message: "Stock symbol created" } };
};
exports.createStockSymbolService = createStockSymbolService;
// Service: Get All Stock Balances
const getAllStockBalancesService = () => {
    return { status: 200, data: STOCK_BALANCES };
};
exports.getAllStockBalancesService = getAllStockBalancesService;
const getAllInrBalancesService = () => {
    return { status: 200, data: INR_BALANCES };
};
exports.getAllInrBalancesService = getAllInrBalancesService;
// Service: Get Order Book by Symbol
const getOrderBookBySymbolService = (symbol) => {
    const orderBook = ORDERBOOK[symbol];
    if (!orderBook) {
        return { status: 404, data: { message: "Order book not found" } };
    }
    return { status: 200, data: orderBook };
};
exports.getOrderBookBySymbolService = getOrderBookBySymbolService;
// Service: Get Full Order Book
const getOrderBookService = () => {
    return { status: 200, data: ORDERBOOK };
};
exports.getOrderBookService = getOrderBookService;
// Service: Get User INR Balance
const getUserBalanceService = (userId) => {
    const balance = INR_BALANCES[userId];
    if (!balance) {
        return { status: 404, data: { message: "User not found" } };
    }
    return { status: 200, data: balance };
};
exports.getUserBalanceService = getUserBalanceService;
// Service: Get User Stock Balance
const getUserStockBalanceService = (userId) => {
    const stockBalance = STOCK_BALANCES[userId];
    if (!stockBalance) {
        return { status: 404, data: { message: "User not found" } };
    }
    return { status: 200, data: stockBalance };
};
exports.getUserStockBalanceService = getUserStockBalanceService;
// Service: Mint Tokens
const mintTokenService = (userId, stockSymbol, quantity) => {
    if (!INR_BALANCES[userId]) {
        return { status: 404, data: { message: "User not found" } };
    }
    STOCK_BALANCES[userId] = STOCK_BALANCES[userId] || {};
    STOCK_BALANCES[userId][stockSymbol] = STOCK_BALANCES[userId][stockSymbol] || {
        yes: { quantity: 0, locked: 0 },
        no: { quantity: 0, locked: 0 },
    };
    STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
    pushToQueue("mint_token_queue", { userId, stockSymbol, quantity });
    return {
        status: 200,
        data: { message: `Minted ${quantity} tokens for ${stockSymbol}` },
    };
};
exports.mintTokenService = mintTokenService;
// Service: Place Buy Order
const placeBuyOrderService = (userId, stockSymbol, quantity, price, option) => __awaiter(void 0, void 0, void 0, function* () {
    const user = INR_BALANCES[userId];
    if (!user)
        return { status: 404, data: { message: "User not found" } };
    const totalCost = quantity * price;
    if (user.balance < totalCost)
        return { status: 400, data: { message: "Insufficient balance" } };
    user.balance -= totalCost;
    user.locked += totalCost;
    ORDERBOOK[stockSymbol] = ORDERBOOK[stockSymbol] || { yes: {}, no: {} };
    const stockOrders = ORDERBOOK[stockSymbol][option];
    stockOrders[price] = stockOrders[price] || { total: 0, orders: {} };
    stockOrders[price].total += quantity;
    stockOrders[price].orders[userId] = { quantity, type: "regular" };
    pushToQueue("buy_order_queue", {
        userId,
        stockSymbol,
        quantity,
        price,
        option,
    });
    return { status: 200, data: { message: "Buy order placed" } };
});
exports.placeBuyOrderService = placeBuyOrderService;
// Service: Place Sell Order
const placeSellOrderService = (userId, stockSymbol, quantity, price, option) => {
    var _a, _b;
    const stock = (_b = (_a = STOCK_BALANCES[userId]) === null || _a === void 0 ? void 0 : _a[stockSymbol]) === null || _b === void 0 ? void 0 : _b[option];
    if (!stock || stock.quantity < quantity) {
        return { status: 400, data: { message: "Insufficient stock" } };
    }
    stock.quantity -= quantity;
    stock.locked += quantity;
    ORDERBOOK[stockSymbol] = ORDERBOOK[stockSymbol] || { yes: {}, no: {} };
    const stockOrders = ORDERBOOK[stockSymbol][option];
    stockOrders[price] = stockOrders[price] || { total: 0, orders: {} };
    stockOrders[price].total += quantity;
    stockOrders[price].orders[userId] = { quantity, type: "regular" };
    pushToQueue("sell_order_queue", {
        userId,
        stockSymbol,
        quantity,
        price,
        option,
    });
    return { status: 200, data: { message: "Sell order placed" } };
};
exports.placeSellOrderService = placeSellOrderService;
// Service: Reset Data
const resetDataService = () => {
    INR_BALANCES = {};
    STOCK_BALANCES = {};
    ORDERBOOK = {};
    return { status: 200, data: { message: "Data reset" } };
};
exports.resetDataService = resetDataService;
// Export all services
const services = {
    createUserService: exports.createUserService,
    addBalanceService: exports.addBalanceService,
    createStockSymbolService: exports.createStockSymbolService,
    getAllStockBalancesService: exports.getAllStockBalancesService,
    getOrderBookService: exports.getOrderBookService,
    getOrderBookBySymbolService: exports.getOrderBookBySymbolService,
    getUserBalanceService: exports.getUserBalanceService,
    getUserStockBalanceService: exports.getUserStockBalanceService,
    placeBuyOrderService: exports.placeBuyOrderService,
    placeSellOrderService: exports.placeSellOrderService,
    mintTokenService: exports.mintTokenService,
    resetDataService: exports.resetDataService,
    getAllInrBalancesService: exports.getAllInrBalancesService,
};
exports.default = services;
