//v1.5
import { createClient } from "redis";

// Connect to Redis
const client = createClient();
client.connect().catch(console.error);
client.on("error", (err) => {
  console.log("Redis Client Error: " + err);
});

// Data Interfaces
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
  [userId: string]: { [stockSymbol: string]: { yes: Stock; no: Stock } };
} = {};
let ORDERBOOK: { [stockSymbol: string]: OrderBook } = {};

// Utility to push data to Redis queue
const pushToQueue = async (key: string, data: any) => {
  try {
    await client.lPush(key, JSON.stringify(data));
    console.log(`Data pushed to Redis queue: ${key}`);
  } catch (error) {
    console.error("Error pushing data to Redis queue:", error);
  }
};

// Create a new user
export const createUserService = (userId: string) => {
  if (INR_BALANCES[userId]) {
    return { status: 400, data: { message: "User already exists" } };
  }

  INR_BALANCES[userId] = { balance: 0, locked: 0 };
  pushToQueue("user_creation_queue", { userId, balance: INR_BALANCES[userId] });

  return { status: 201, data: { message: "User created" } };
};

// Add balance to a user
export const addBalanceService = (userId: string, amount: number) => {
  const user = INR_BALANCES[userId];
  if (!user) {
    return { status: 404, data: { message: "User not found" } };
  }

  user.balance += amount;
  pushToQueue("balance_update_queue", { userId, balance: user });

  return { status: 200, data: { message: `Added ${amount} to ${userId}` } };
};

// Create a new stock symbol
export const createStockSymbolService = (stockSymbol: string) => {
  if (ORDERBOOK[stockSymbol]) {
    return { status: 400, data: { message: "Stock symbol already exists" } };
  }

  ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  pushToQueue("stock_creation_queue", { stockSymbol });

  return { status: 201, data: { message: "Stock symbol created" } };
};

// Mint tokens for a user
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

// Helper function for stock swapping
const swapStocks = (
  userId: string,
  stockSymbol: string,
  sellerId: string,
  price: number,
  stockOption: "yes" | "no",
  quantity: number
) => {
  STOCK_BALANCES[sellerId][stockSymbol][stockOption].locked -= quantity;
  STOCK_BALANCES[userId][stockSymbol][stockOption].quantity += quantity;

  INR_BALANCES[userId].balance -= quantity * price;
  INR_BALANCES[sellerId].balance += quantity * price;
};

// Helper function for minting stocks
const mintStocks = (
  userId: string,
  stockSymbol: string,
  sellerId: string,
  price: number,
  stockOption: "yes" | "no",
  quantity: number
) => {
  const oppositeOption = stockOption === "yes" ? "no" : "yes";
  const correspondingPrice = 10 - price;

  STOCK_BALANCES[sellerId][stockSymbol][oppositeOption].quantity += quantity;
  STOCK_BALANCES[userId][stockSymbol][stockOption].quantity += quantity;
  INR_BALANCES[userId].balance -= quantity * price;
  INR_BALANCES[sellerId].locked -= quantity * correspondingPrice;
};

// Place a buy order
export const placeBuyOrderService = async (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  stockOption: "yes" | "no"
) => {
  if (!INR_BALANCES[userId]) {
    return { status: 404, data: { message: "User not found" } };
  }

  const totalCost = quantity * price;
  if (INR_BALANCES[userId].balance < totalCost) {
    return { status: 400, data: { message: "Insufficient balance" } };
  }

  INR_BALANCES[userId].balance -= totalCost;
  INR_BALANCES[userId].locked += totalCost;

  if (!ORDERBOOK[stockSymbol]) {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  }

  let remainingQuantity = quantity;

  // Match orders if possible
  if (
    ORDERBOOK[stockSymbol][stockOption][price] &&
    ORDERBOOK[stockSymbol][stockOption][price].total >= remainingQuantity
  ) {
    ORDERBOOK[stockSymbol][stockOption][price].total -= remainingQuantity;

    for (const sellerId in ORDERBOOK[stockSymbol][stockOption][price].orders) {
      const sellerOrder =
        ORDERBOOK[stockSymbol][stockOption][price].orders[sellerId];
      const availableQuantity = Math.min(
        sellerOrder.quantity,
        remainingQuantity
      );

      if (sellerOrder.type === "minted") {
        mintStocks(
          userId,
          stockSymbol,
          sellerId,
          price,
          stockOption,
          availableQuantity
        );
      } else {
        swapStocks(
          userId,
          stockSymbol,
          sellerId,
          price,
          stockOption,
          availableQuantity
        );
      }

      remainingQuantity -= availableQuantity;
      ORDERBOOK[stockSymbol][stockOption][price].orders[sellerId].quantity -=
        availableQuantity;

      if (remainingQuantity === 0) {
        break;
      }
    }
  }

  // Add any remaining quantity to the order book
  if (remainingQuantity > 0) {
    if (!ORDERBOOK[stockSymbol][stockOption][price]) {
      ORDERBOOK[stockSymbol][stockOption][price] = { total: 0, orders: {} };
    }

    ORDERBOOK[stockSymbol][stockOption][price].total += remainingQuantity;
    ORDERBOOK[stockSymbol][stockOption][price].orders[userId] = {
      quantity: remainingQuantity,
      type: "minted",
    };
  }

  pushToQueue("buy_order_queue", {
    userId,
    stockSymbol,
    quantity,
    price,
    stockOption,
  });

  return { status: 200, data: { message: "Buy order placed" } };
};

// Place a sell order
export const placeSellOrderService = (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number,
  stockOption: "yes" | "no"
) => {
  const stock = STOCK_BALANCES[userId]?.[stockSymbol]?.[stockOption];
  if (!stock || stock.quantity < quantity) {
    return { status: 400, data: { message: "Insufficient stock" } };
  }

  stock.quantity -= quantity;
  stock.locked += quantity;

  if (!ORDERBOOK[stockSymbol]) {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  }

  if (!ORDERBOOK[stockSymbol][stockOption][price]) {
    ORDERBOOK[stockSymbol][stockOption][price] = { total: 0, orders: {} };
  }

  ORDERBOOK[stockSymbol][stockOption][price].total += quantity;
  ORDERBOOK[stockSymbol][stockOption][price].orders[userId] = {
    quantity,
    type: "regular",
  };

  pushToQueue("sell_order_queue", {
    userId,
    stockSymbol,
    quantity,
    price,
    stockOption,
  });

  return { status: 200, data: { message: "Sell order placed" } };
};

// Get user INR balance
export const getUserBalanceService = (userId: string) => {
  const user = INR_BALANCES[userId];
  if (!user) {
    return { status: 404, data: { message: "User not found" } };
  }
  return { status: 200, data: { balance: user } };
};

// Get stock balances for a user
export const getUserStockBalanceService = (userId: string) => {
  const stockBalance = STOCK_BALANCES[userId];
  if (!stockBalance) {
    return { status: 404, data: { message: "User has no stock balance" } };
  }
  return { status: 200, data: { stockBalance } };
};

// Get order book for a stock symbol
export const getOrderBookService = (stockSymbol: string) => {
  const orderBook = ORDERBOOK[stockSymbol];
  if (!orderBook) {
    return { status: 404, data: { message: "Stock symbol not found" } };
  }
  return { status: 200, data: { orderBook } };
};

// Reset data for testing
export const resetDataService = () => {
  INR_BALANCES = {};
  STOCK_BALANCES = {};
  ORDERBOOK = {};

  return { status: 200, data: { message: "Data reset" } };
};

//v1.5

const services = {
  resetDataService,
  createUserService,
  addBalanceService,
  createStockSymbolService,
  mintTokenService,
  mintStocks,
  getUserBalanceService,
  getUserStockBalanceService,
  getOrderBookService,
  placeBuyOrderService,
  placeSellOrderService,
};

export default services;
