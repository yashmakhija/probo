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
exports.placeSellOrderService = exports.placeBuyOrderService = exports.mintTokenService = exports.userStockBalanceService = exports.userInrBalanceService = exports.showOrderBookSymbolService = exports.showAllUserService = exports.inrBalanceService = exports.stockBalanceService = exports.newSymbolService = exports.addBalanceService = exports.createUserService = exports.resetDataService = void 0;
//v1.5 - Refactored Services with Redis Integration
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
// Redis Data Access Functions
const getBalanceFromRedis = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const balance = yield client.hGet("INR_BALANCES", userId);
    return balance ? JSON.parse(balance) : null;
});
const updateBalanceInRedis = (userId, balance) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.hSet("INR_BALANCES", userId, JSON.stringify(balance));
});
const getStockBalancesFromRedis = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const stockBalances = yield client.hGet("STOCK_BALANCES", userId);
    return stockBalances ? JSON.parse(stockBalances) : null;
});
const updateStockBalancesInRedis = (userId, stockBalances) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.hSet("STOCK_BALANCES", userId, JSON.stringify(stockBalances));
});
const getOrderBookFromRedis = (stockSymbol) => __awaiter(void 0, void 0, void 0, function* () {
    const orderBook = yield client.hGet("ORDERBOOK", stockSymbol);
    return orderBook ? JSON.parse(orderBook) : null;
});
const updateOrderBookInRedis = (stockSymbol, orderBook) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.hSet("ORDERBOOK", stockSymbol, JSON.stringify(orderBook));
});
// Service Methods
const resetDataService = () => __awaiter(void 0, void 0, void 0, function* () {
    yield client.del("INR_BALANCES");
    yield client.del("STOCK_BALANCES");
    yield client.del("ORDERBOOK");
    return { status: 200, data: { message: "Reset Done!" } };
});
exports.resetDataService = resetDataService;
const createUserService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield getBalanceFromRedis(userId);
    if (existingUser) {
        return { status: 400, data: { message: "User already exists" } };
    }
    const newUser = { balance: 0, locked: 0 };
    yield updateBalanceInRedis(userId, newUser);
    return { status: 201, data: { message: `User ${userId} created` } };
});
exports.createUserService = createUserService;
const addBalanceService = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const balanceData = yield getBalanceFromRedis(userId);
    if (!balanceData) {
        return { status: 404, data: { message: "User not found" } };
    }
    balanceData.balance += amount;
    yield updateBalanceInRedis(userId, balanceData);
    return {
        status: 200,
        data: { message: `Onramped ${userId} with amount ${amount}` },
    };
});
exports.addBalanceService = addBalanceService;
const newSymbolService = (stockSymbol, userId) => __awaiter(void 0, void 0, void 0, function* () {
    let stockBalances = yield getStockBalancesFromRedis(userId);
    if (!stockBalances) {
        stockBalances = {};
    }
    if (stockBalances[stockSymbol]) {
        return {
            status: 400,
            data: { message: `${stockSymbol} already exists for ${userId}` },
        };
    }
    stockBalances[stockSymbol] = {
        yes: { quantity: 0, locked: 0 },
        no: { quantity: 0, locked: 0 },
    };
    yield updateStockBalancesInRedis(userId, stockBalances);
    let orderBook = yield getOrderBookFromRedis(stockSymbol);
    if (!orderBook) {
        orderBook = { yes: {}, no: {} };
        yield updateOrderBookInRedis(stockSymbol, orderBook);
    }
    return {
        status: 201,
        data: {
            message: `Symbol ${stockSymbol} created for ${userId}`,
            stockSymbol: stockBalances[stockSymbol],
        },
    };
});
exports.newSymbolService = newSymbolService;
const stockBalanceService = () => __awaiter(void 0, void 0, void 0, function* () {
    const stockBalances = yield client.hGetAll("STOCK_BALANCES");
    const balance = Object.keys(stockBalances).map((userId) => ({
        userId,
        stockBalances: JSON.parse(stockBalances[userId]),
    }));
    return { status: 200, data: { balance } };
});
exports.stockBalanceService = stockBalanceService;
const inrBalanceService = () => __awaiter(void 0, void 0, void 0, function* () {
    const balances = yield client.hGetAll("INR_BALANCES");
    const balance = Object.keys(balances).map((userId) => ({
        userId,
        inrBalances: JSON.parse(balances[userId]),
    }));
    return { status: 200, data: { balance } };
});
exports.inrBalanceService = inrBalanceService;
const showAllUserService = () => __awaiter(void 0, void 0, void 0, function* () {
    const balances = yield client.hGetAll("INR_BALANCES");
    const stockBalances = yield client.hGetAll("STOCK_BALANCES");
    const users = Object.keys(balances).map((userId) => ({
        userId,
        inrBalances: JSON.parse(balances[userId]),
        stockBalances: JSON.parse(stockBalances[userId] || "{}"),
    }));
    return { status: 200, data: { users } };
});
exports.showAllUserService = showAllUserService;
const showOrderBookSymbolService = (stockSymbol) => __awaiter(void 0, void 0, void 0, function* () {
    const orderBook = yield getOrderBookFromRedis(stockSymbol);
    if (!orderBook) {
        return {
            status: 404,
            data: { message: `Stock ${stockSymbol} does not exist` },
        };
    }
    return { status: 200, data: { symbol: stockSymbol, orderBook } };
});
exports.showOrderBookSymbolService = showOrderBookSymbolService;
const userInrBalanceService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const balance = yield getBalanceFromRedis(userId);
    if (!balance) {
        return { status: 404, data: { message: `User does not exist` } };
    }
    return { status: 200, data: { userId, balance } };
});
exports.userInrBalanceService = userInrBalanceService;
const userStockBalanceService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const stockBalance = yield getStockBalancesFromRedis(userId);
    if (!stockBalance) {
        return {
            status: 404,
            data: { message: `User does not have any stock balance` },
        };
    }
    return { status: 200, data: { userId, stockBalance } };
});
exports.userStockBalanceService = userStockBalanceService;
const mintTokenService = (userId, stockSymbol, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const stockBalances = yield getStockBalancesFromRedis(userId);
    if (!stockBalances || !stockBalances[stockSymbol]) {
        return { status: 404, data: { message: "Invalid inputs" } };
    }
    stockBalances[stockSymbol].yes.quantity += quantity;
    stockBalances[stockSymbol].no.quantity += quantity;
    yield updateStockBalancesInRedis(userId, stockBalances);
    return {
        status: 200,
        data: {
            message: `Minted ${quantity} tokens for ${stockSymbol}`,
            stockBalances: stockBalances[stockSymbol],
        },
    };
});
exports.mintTokenService = mintTokenService;
const placeBuyOrderService = (userId, stockSymbol, quantity, price, stockType) => __awaiter(void 0, void 0, void 0, function* () {
    const userBalance = yield getBalanceFromRedis(userId);
    if (!userBalance) {
        return { status: 404, data: { message: "User not found" } };
    }
    const totalCost = quantity * price;
    if (userBalance.balance < totalCost) {
        return { status: 400, data: { message: "Insufficient balance" } };
    }
    // Lock funds for the buy order
    userBalance.balance -= totalCost;
    userBalance.locked += totalCost;
    yield updateBalanceInRedis(userId, userBalance);
    let orderBook = yield getOrderBookFromRedis(stockSymbol);
    if (!orderBook) {
        orderBook = { yes: {}, no: {} };
    }
    // Attempt to match the order
    let remainingQuantity = quantity;
    for (const existingPrice in orderBook[stockType]) {
        if (remainingQuantity <= 0)
            break;
        const existingPriceNumber = parseFloat(existingPrice);
        if (stockType === "yes" && existingPriceNumber > price)
            continue;
        if (stockType === "no" && existingPriceNumber < price)
            continue;
        const existingOrders = orderBook[stockType][existingPrice];
        for (const existingUserId in existingOrders.orders) {
            if (remainingQuantity <= 0)
                break;
            if (existingUserId === userId)
                continue;
            const availableQuantity = existingOrders.orders[existingUserId];
            const quantityToMatch = Math.min(availableQuantity, remainingQuantity);
            const matchCost = quantityToMatch * existingPriceNumber;
            // Update balances for matched user
            const matchedUserBalance = yield getBalanceFromRedis(existingUserId);
            if (matchedUserBalance) {
                matchedUserBalance.locked -= matchCost;
                matchedUserBalance.balance += matchCost;
                yield updateBalanceInRedis(existingUserId, matchedUserBalance);
            }
            // Update stock balances for both users
            let buyerStockBalances = yield getStockBalancesFromRedis(userId);
            let sellerStockBalances = yield getStockBalancesFromRedis(existingUserId);
            if (!buyerStockBalances)
                buyerStockBalances = {};
            if (!sellerStockBalances)
                sellerStockBalances = {};
            buyerStockBalances[stockSymbol] = buyerStockBalances[stockSymbol] || {
                yes: { quantity: 0 },
                no: { quantity: 0 },
            };
            sellerStockBalances[stockSymbol] = sellerStockBalances[stockSymbol] || {
                yes: { quantity: 0 },
                no: { quantity: 0 },
            };
            buyerStockBalances[stockSymbol][stockType].quantity += quantityToMatch;
            sellerStockBalances[stockSymbol][stockType].quantity -= quantityToMatch;
            // Update Redis with new stock balances
            yield updateStockBalancesInRedis(userId, buyerStockBalances);
            yield updateStockBalancesInRedis(existingUserId, sellerStockBalances);
            // Update order book
            existingOrders.total -= quantityToMatch;
            existingOrders.orders[existingUserId] -= quantityToMatch;
            if (existingOrders.orders[existingUserId] <= 0) {
                delete existingOrders.orders[existingUserId];
            }
            remainingQuantity -= quantityToMatch;
        }
        // Remove price level if no orders are left
        if (existingOrders.total <= 0) {
            delete orderBook[stockType][existingPrice];
        }
    }
    // If remaining quantity, add it to the order book
    if (remainingQuantity > 0) {
        if (!orderBook[stockType][price]) {
            orderBook[stockType][price] = { total: 0, orders: {} };
        }
        orderBook[stockType][price].total += remainingQuantity;
        orderBook[stockType][price].orders[userId] =
            (orderBook[stockType][price].orders[userId] || 0) + remainingQuantity;
        yield updateOrderBookInRedis(stockSymbol, orderBook);
        return {
            status: 200,
            data: {
                status: "partial",
                message: `Order partially matched, remaining quantity: ${remainingQuantity}`,
            },
        };
    }
    return {
        status: 200,
        data: { status: "success", message: "Order fully matched." },
    };
});
exports.placeBuyOrderService = placeBuyOrderService;
const placeSellOrderService = (userId, stockSymbol, quantity, price, stockType) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch the user's stock balances from Redis
    const userStockBalances = yield getStockBalancesFromRedis(userId);
    if (!userStockBalances ||
        !userStockBalances[stockSymbol] ||
        !userStockBalances[stockSymbol][stockType]) {
        return { status: 404, data: { message: "Insufficient stock to sell" } };
    }
    // Check if the user has enough stock to sell
    if (userStockBalances[stockSymbol][stockType].quantity < quantity) {
        return { status: 404, data: { message: "Insufficient stock to sell" } };
    }
    // Lock the stock for the sell order
    userStockBalances[stockSymbol][stockType].quantity -= quantity;
    userStockBalances[stockSymbol][stockType].locked =
        (userStockBalances[stockSymbol][stockType].locked || 0) + quantity;
    yield updateStockBalancesInRedis(userId, userStockBalances);
    // Fetch the order book from Redis
    let orderBook = yield getOrderBookFromRedis(stockSymbol);
    if (!orderBook) {
        orderBook = { yes: {}, no: {} };
    }
    // Attempt to match the sell order
    let remainingQuantity = quantity;
    const oppositeType = stockType === "yes" ? "no" : "yes";
    if (orderBook[oppositeType]) {
        for (const existingPrice in orderBook[oppositeType]) {
            if (remainingQuantity <= 0)
                break;
            const existingPriceNumber = parseFloat(existingPrice);
            if (stockType === "yes" && existingPriceNumber < price)
                continue;
            if (stockType === "no" && existingPriceNumber > price)
                continue;
            const existingOrders = orderBook[oppositeType][existingPrice];
            if (!existingOrders || !existingOrders.orders)
                continue;
            for (const existingUserId in existingOrders.orders) {
                if (remainingQuantity <= 0)
                    break;
                if (existingUserId === userId)
                    continue;
                const availableQuantity = existingOrders.orders[existingUserId];
                const quantityToMatch = Math.min(availableQuantity, remainingQuantity);
                const matchCost = quantityToMatch * existingPriceNumber;
                // Update the buyer's balance
                const buyerBalance = yield getBalanceFromRedis(existingUserId);
                if (buyerBalance) {
                    buyerBalance.locked -= matchCost;
                    buyerBalance.balance += matchCost;
                    yield updateBalanceInRedis(existingUserId, buyerBalance);
                }
                // Update stock balances for both users
                let buyerStockBalances = yield getStockBalancesFromRedis(existingUserId);
                if (!buyerStockBalances)
                    buyerStockBalances = {};
                buyerStockBalances[stockSymbol] = buyerStockBalances[stockSymbol] || {
                    yes: { quantity: 0 },
                    no: { quantity: 0 },
                };
                buyerStockBalances[stockSymbol][oppositeType].quantity +=
                    quantityToMatch;
                userStockBalances[stockSymbol][stockType].locked -= quantityToMatch;
                // Update Redis with the new stock balances
                yield updateStockBalancesInRedis(existingUserId, buyerStockBalances);
                yield updateStockBalancesInRedis(userId, userStockBalances);
                // Update the order book
                existingOrders.total -= quantityToMatch;
                existingOrders.orders[existingUserId] -= quantityToMatch;
                if (existingOrders.orders[existingUserId] <= 0) {
                    delete existingOrders.orders[existingUserId];
                }
                remainingQuantity -= quantityToMatch;
            }
            // Remove the price level if no orders are left
            if (existingOrders.total <= 0) {
                delete orderBook[oppositeType][existingPrice];
            }
        }
    }
    // If there is remaining quantity, add it to the order book
    if (remainingQuantity > 0) {
        if (!orderBook[stockType][price]) {
            orderBook[stockType][price] = { total: 0, orders: {} };
        }
        orderBook[stockType][price].total += remainingQuantity;
        orderBook[stockType][price].orders[userId] =
            (orderBook[stockType][price].orders[userId] || 0) + remainingQuantity;
        yield updateOrderBookInRedis(stockSymbol, orderBook);
        return {
            status: 200,
            data: {
                status: "partial",
                message: `Order partially matched, remaining quantity: ${remainingQuantity}`,
            },
        };
    }
    return {
        status: 200,
        data: { status: "success", message: "Sell order fully matched." },
    };
});
exports.placeSellOrderService = placeSellOrderService;
// Export all services
const services = {
    resetDataService: exports.resetDataService,
    createUserService: exports.createUserService,
    addBalanceService: exports.addBalanceService,
    newSymbolService: exports.newSymbolService,
    stockBalanceService: exports.stockBalanceService,
    inrBalanceService: exports.inrBalanceService,
    showAllUserService: exports.showAllUserService,
    showOrderBookSymbolService: exports.showOrderBookSymbolService,
    userInrBalanceService: exports.userInrBalanceService,
    userStockBalanceService: exports.userStockBalanceService,
    mintTokenService: exports.mintTokenService,
    placeSellOrderService: exports.placeSellOrderService,
    placeBuyOrderService: exports.placeBuyOrderService,
};
exports.default = services;
