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
exports.placeBuyOrderService = exports.createUserService = exports.resetDataService = void 0;
//v1.5
const redis_1 = require("redis");
const client = (0, redis_1.createClient)();
const connectToRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        console.log("Connected to Redis 🔥..");
    }
    catch (err) {
        console.error("Error connecting to Redis:", err);
    }
});
connectToRedis();
client.on("error", (err) => {
    console.log("Redis Client Error: " + err);
});
let INR_BALANCES = {};
let STOCK_BALANCES = {};
let ORDERBOOK = {};
const resetDataService = () => {
    INR_BALANCES = {};
    STOCK_BALANCES = {};
    ORDERBOOK = {};
    return { status: 200, data: { msg: "Reset Done!" } };
};
exports.resetDataService = resetDataService;
const createUserService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield client.hGet("INR_BALANCES", userId);
    if (existingUser) {
        return { status: 400, data: { msg: "User already exists" } };
    }
    const newUser = { balance: 0, locked: 0 };
    yield client.hSet("INR_BALANCES", userId, JSON.stringify(newUser));
    return { status: 201, data: { msg: `User ${userId} created` } };
});
exports.createUserService = createUserService;
function addBalanceService(userId, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const userBalance = yield client.hGet("INR_BALANCES", userId);
        if (!userBalance) {
            return { status: 404, data: { msg: "User not found" } };
        }
        const balanceData = JSON.parse(userBalance);
        balanceData.balance += amount;
        yield client.hSet("INR_BALANCES", userId, JSON.stringify(balanceData));
        return {
            status: 200,
            data: { msg: `Onramped ${userId} with amount ${amount}` },
        };
    });
}
function newSymbolService(stockSymbol, userId) {
    if (!STOCK_BALANCES[userId]) {
        STOCK_BALANCES[userId] = {};
    }
    if (STOCK_BALANCES[userId][stockSymbol]) {
        return {
            status: 404,
            data: { msg: `${stockSymbol} is already exist for this ${userId}` },
        };
    }
    STOCK_BALANCES[userId][stockSymbol] = {
        yes: {
            quantity: 0,
            locked: 0,
        },
        no: {
            quantity: 0,
            locked: 0,
        },
    };
    if (!ORDERBOOK[stockSymbol]) {
        ORDERBOOK[stockSymbol] = {
            yes: {},
            no: {},
        };
    }
    return {
        status: 200,
        data: {
            msg: `Symbol ${stockSymbol} created for ${userId}`,
            stockSymbol: STOCK_BALANCES[userId][stockSymbol],
        },
    };
}
function stockBalanceService() {
    const balance = Object.keys(STOCK_BALANCES).map((userId) => ({
        userId,
        stockBalances: STOCK_BALANCES[userId] || {},
    }));
    return { status: 200, data: { balance } };
}
function inrBalanceService() {
    const balance = Object.keys(INR_BALANCES).map((userId) => ({
        userId,
        inrBalances: INR_BALANCES[userId] || {},
    }));
    return { status: 200, data: { balance } };
}
function showAllUserService() {
    const user = Object.keys(INR_BALANCES).map((userId) => ({
        userId,
        inrBalances: INR_BALANCES[userId] || {},
        stockBalances: STOCK_BALANCES[userId] || {},
    }));
    return {
        status: 200,
        data: { user },
    };
}
function showOrderBookSymbolService(stockSymbol) {
    if (!stockSymbol) {
        return {
            status: 404,
            data: { msg: `${stockSymbol} is not created yet!!` },
        };
    }
    if (!ORDERBOOK[stockSymbol]) {
        return {
            status: 404,
            data: { msg: `Stock ${stockSymbol} does not exist` },
        };
    }
    return {
        status: 200,
        data: { symbol: stockSymbol, orderBook: ORDERBOOK[stockSymbol] },
    };
}
function userInrBalanceService(userId) {
    if (!INR_BALANCES[userId]) {
        return {
            status: 404,
            data: { msg: `user doesn't exist` },
        };
    }
    return {
        status: 200,
        data: { userId, balance: INR_BALANCES[userId] },
    };
}
function userStockBalanceService(userId) {
    const stockBalance = STOCK_BALANCES[userId];
    if (!stockBalance) {
        return {
            status: 404,
            data: { msg: `user doesnt have any stock balance` },
        };
    }
    return {
        status: 200,
        data: { userId, stockBalance },
    };
}
function mintTokenService(userId, stockSymbol, quantity) {
    if (!INR_BALANCES[userId] ||
        !STOCK_BALANCES[userId] ||
        !STOCK_BALANCES[userId][stockSymbol] ||
        !quantity ||
        quantity <= 0) {
        return {
            status: 404,
            data: { msg: `Invalid inputs` },
        };
    }
    STOCK_BALANCES[userId] = STOCK_BALANCES[userId] || {};
    STOCK_BALANCES[userId][stockSymbol] = STOCK_BALANCES[userId][stockSymbol] || {
        yes: {
            quantity: 0,
        },
        no: {
            quantity: 0,
        },
    };
    STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
    return {
        status: 200,
        data: {
            message: `Minted ${quantity} tokens for both 'yes' and 'no' for ${stockSymbol}`,
            stockBalances: STOCK_BALANCES[userId][stockSymbol],
        },
    };
}
const placeBuyOrderService = (userId, stockSymbol, quantity, price, stockType) => __awaiter(void 0, void 0, void 0, function* () {
    const userBalance = yield client.hGet("INR_BALANCES", userId);
    if (!userBalance) {
        return { status: 404, data: { msg: "User not found" } };
    }
    const balanceData = JSON.parse(userBalance);
    const totalCost = quantity * price;
    if (balanceData.balance < totalCost) {
        return { status: 400, data: { msg: "Insufficient balance" } };
    }
    balanceData.balance -= totalCost;
    balanceData.locked += totalCost;
    yield client.hSet("INR_BALANCES", userId, JSON.stringify(balanceData));
    const orderKey = `ORDERBOOK:${stockSymbol}:${stockType}:${price}`;
    const order = {
        userId,
        quantity,
        type: "regular",
    };
    if (!ORDERBOOK[stockSymbol]) {
        ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    }
    let remainingQuantity = quantity;
    const oppositeType = stockType === "yes" ? "no" : "yes";
    for (let existingPrice in ORDERBOOK[stockSymbol][stockType]) {
        const existingPriceNumber = parseFloat(existingPrice);
        if (remainingQuantity <= 0)
            break;
        const existingOrders = ORDERBOOK[stockSymbol][stockType][existingPrice];
        if (!existingOrders || !existingOrders.orders) {
            continue;
        }
        for (let existingUserId in existingOrders.orders) {
            if (remainingQuantity <= 0)
                break;
            if (existingUserId === userId)
                continue; // Avoid matching with own orders
            const availableQuantity = existingOrders.orders[existingUserId];
            const quantityToMatch = Math.min(availableQuantity, remainingQuantity);
            const matchCost = quantityToMatch * existingPriceNumber;
            // Update the balances of the matched user
            INR_BALANCES[existingUserId].locked -= matchCost;
            INR_BALANCES[existingUserId].balance += matchCost;
            // Ensure the stock balances are initialized
            STOCK_BALANCES[userId] = STOCK_BALANCES[userId] || {};
            STOCK_BALANCES[userId][stockSymbol] = STOCK_BALANCES[userId][stockSymbol] || {
                yes: { quantity: 0 },
                no: { quantity: 0 },
            };
            // Update stock balances for both users
            STOCK_BALANCES[existingUserId][stockSymbol][stockType].quantity -=
                quantityToMatch;
            STOCK_BALANCES[userId][stockSymbol][stockType].quantity +=
                quantityToMatch;
            // Update the order book
            existingOrders.total -= quantityToMatch;
            existingOrders.orders[existingUserId] -= quantityToMatch;
            if (existingOrders.orders[existingUserId] <= 0) {
                delete existingOrders.orders[existingUserId];
            }
            remainingQuantity -= quantityToMatch;
        }
        // Remove the price level from the order book if no more orders are left
        if (existingOrders.total <= 0) {
            delete ORDERBOOK[stockSymbol][stockType][existingPrice];
        }
    }
    // Handle remaining quantity if there is any
    if (remainingQuantity > 0) {
        // You can choose to add the remaining order to the order book or handle it differently
        return {
            status: 200,
            data: {
                status: "partial",
                msg: `Order partially matched, remaining quantity: ${remainingQuantity}`,
            },
        };
    }
    else {
        return {
            status: 200,
            data: { status: "success", msg: `Order fully matched.` },
        };
    }
});
exports.placeBuyOrderService = placeBuyOrderService;
function placeSellOrderService(userId, stockSymbol, quantity, price, stockType) {
    if (stockType !== "yes" && stockType !== "no") {
        return {
            status: 404,
            data: { message: "Invalid stock type. Must be 'yes' or 'no'" },
        };
        return;
    }
    if (quantity <= 0 || price <= 0) {
        return {
            status: 404,
            data: { message: "Quantity and price must be positive numbers." },
        };
    }
    if (!STOCK_BALANCES[userId] ||
        !STOCK_BALANCES[userId][stockSymbol] ||
        STOCK_BALANCES[userId][stockSymbol][stockType].quantity < quantity) {
        return {
            status: 404,
            data: { message: "Insufficient stock to sell." },
        };
    }
    STOCK_BALANCES[userId][stockSymbol][stockType].locked =
        (STOCK_BALANCES[userId][stockSymbol][stockType].locked || 0) + quantity;
    // Initialize the order book if it does not exist
    if (!ORDERBOOK[stockSymbol]) {
        ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    }
    // Initialize the price level in the order book
    if (!ORDERBOOK[stockSymbol][stockType][price]) {
        ORDERBOOK[stockSymbol][stockType][price] = { total: 0, orders: {} };
    }
    // Add the sell order to the order book
    ORDERBOOK[stockSymbol][stockType][price].total += quantity;
    if (!ORDERBOOK[stockSymbol][stockType][price].orders[userId]) {
        ORDERBOOK[stockSymbol][stockType][price].orders[userId] = 0;
    }
    ORDERBOOK[stockSymbol][stockType][price].orders[userId] += quantity;
    return {
        status: 200,
        data: {
            message: `Sell order placed for ${quantity} at price ${price}`,
            orderbook: ORDERBOOK[stockSymbol],
        },
    };
}
//v1.5
const services = {
    resetDataService: exports.resetDataService,
    createUserService: exports.createUserService,
    addBalanceService,
    newSymbolService,
    stockBalanceService,
    inrBalanceService,
    showAllUserService,
    showOrderBookSymbolService,
    userInrBalanceService,
    userStockBalanceService,
    mintTokenService,
    placeBuyOrderService: exports.placeBuyOrderService,
    placeSellOrderService,
};
exports.default = services;
