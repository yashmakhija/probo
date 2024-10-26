import { createClient } from "redis";

// Interfaces for data types
interface Balance {
  balance: number;
  locked: number;
}

interface Stock {
  quantity: number;
  locked: number;
}

interface Order {
  total: number;
  orders: {
    [userId: string]: { quantity: number; type: "minted" | "regular" };
  };
}

interface OrderBook {
  yes: { [price: number]: Order };
  no: { [price: number]: Order };
}

// In-memory storage
let INR_BALANCES: { [userId: string]: Balance } = {};
let STOCK_BALANCES: {
  [userId: string]: { [symbol: string]: { yes: Stock; no: Stock } };
} = {};
let ORDERBOOK: { [symbol: string]: OrderBook } = {};

// Redis client setup
const client = createClient();
client.on("error", (err) => console.error("Redis Client Error:", err));
client.connect().catch(console.error);

// Utility to push data to Redis queue
const pushToQueue = async (key: string, data: any) => {
  try {
    await client.lPush(key, JSON.stringify(data));
    console.log(`Data pushed to Redis queue: ${key}`);
  } catch (error) {
    console.error("Error pushing to Redis queue:", error);
  }
};

// Service: Create User
export const createUserService = (userId: string) => {
  if (INR_BALANCES[userId]) {
    return { status: 400, data: { message: "User already exists" } };
  }

  INR_BALANCES[userId] = { balance: 0, locked: 0 };
  pushToQueue("user_creation_queue", { userId, balance: INR_BALANCES[userId] });

  return { status: 201, data: { message: "User created" } };
};

// Service: Add Balance
export const addBalanceService = (userId: string, amount: number) => {
  const user = INR_BALANCES[userId];
  if (!user) {
    return { status: 404, data: { message: "User not found" } };
  }

  user.balance += amount;
  pushToQueue("balance_update_queue", { userId, balance: user });

  return { status: 200, data: { message: `Added ${amount} to ${userId}` } };
};

// Service: Create Stock Symbol
export const createStockSymbolService = (stockSymbol: string) => {
  if (ORDERBOOK[stockSymbol]) {
    return { status: 400, data: { message: "Stock symbol already exists" } };
  }

  ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  pushToQueue("stock_creation_queue", { stockSymbol });

  return { status: 201, data: { message: "Stock symbol created" } };
};

// Service: Get All Stock Balances
export const getAllStockBalancesService = () => {
  return { status: 200, data: STOCK_BALANCES };
};

export const getAllInrBalancesService = () => {
  return { status: 200, data: INR_BALANCES };
};

// Service: Get Order Book by Symbol
export const getOrderBookBySymbolService = (symbol: string) => {
  const orderBook = ORDERBOOK[symbol];
  if (!orderBook) {
    return { status: 404, data: { message: "Order book not found" } };
  }
  return { status: 200, data: orderBook };
};

// Service: Get Full Order Book
export const getOrderBookService = () => {
  return { status: 200, data: ORDERBOOK };
};

// Service: Get User INR Balance
export const getUserBalanceService = (userId: string) => {
  const balance = INR_BALANCES[userId];
  if (!balance) {
    return { status: 404, data: { message: "User not found" } };
  }
  return { status: 200, data: balance };
};

// Service: Get User Stock Balance
export const getUserStockBalanceService = (userId: string) => {
  const stockBalance = STOCK_BALANCES[userId];
  if (!stockBalance) {
    return { status: 404, data: { message: "User not found" } };
  }
  return { status: 200, data: stockBalance };
};

// Service: Mint Tokens
export const mintTokenService = (
  userId: string,
  stockSymbol: string,
  quantity: number
) => {
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

// Service: Place Buy Order
export const placeBuyOrderService = async (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  option: "yes" | "no"
) => {
  const user = INR_BALANCES[userId];
  if (!user) return { status: 404, data: { message: "User not found" } };

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
};

// Service: Place Sell Order
export const placeSellOrderService = (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  option: "yes" | "no"
) => {
  const stock = STOCK_BALANCES[userId]?.[stockSymbol]?.[option];
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

// Service: Reset Data
export const resetDataService = () => {
  INR_BALANCES = {};
  STOCK_BALANCES = {};
  ORDERBOOK = {};

  return { status: 200, data: { message: "Data reset" } };
};

// Export all services
const services = {
  createUserService,
  addBalanceService,
  createStockSymbolService,
  getAllStockBalancesService,
  getOrderBookService,
  getOrderBookBySymbolService,
  getUserBalanceService,
  getUserStockBalanceService,
  placeBuyOrderService,
  placeSellOrderService,
  mintTokenService,
  resetDataService,
  getAllInrBalancesService,
};

export default services;
