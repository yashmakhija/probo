let INR_BALANCES = {};
let STOCK_BALANCES = {};
let ORDERBOOK = {};

const WebSocket = require("ws");
const wsServer = new WebSocket("ws://localhost:6969");

// Broadcast order book updates
function broadcastOrderBookUpdate(stockSymbol) {
  const message = {
    type: "orderBookUpdate",
    stockSymbol: stockSymbol,
    orderBook: ORDERBOOK[stockSymbol],
  };

  // Send message to all connected clients
  if (wsServer.readyState === WebSocket.OPEN) {
    wsServer.send(JSON.stringify(message));
  }
}

function resetData(req, res) {
  // Reset all data
  INR_BALANCES = {};
  STOCK_BALANCES = {};
  ORDERBOOK = {};

  res.status(200).json({ message: "All data has been reset." });
}

function createUser(req, res) {
  const userId = req.params.userId;

  if (INR_BALANCES[userId]) {
    res.status(400).json({ message: "User already exists." });
    return;
  }
  INR_BALANCES[userId] = { balance: 0, locked: 0 };
  res.status(201).json({ message: `User ${userId} created` });
}

function onrampUser(req, res) {
  const { userId, amount } = req.body;

  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Invalid amount. Must be a positive number." });
  }

  if (!INR_BALANCES[userId]) {
    INR_BALANCES[userId] = { balance: 0, locked: 0 };
  }

  INR_BALANCES[userId].balance += amount;

  res.status(200).json({ message: `Onramped ${userId} with amount ${amount}` });
}

function createSymbol(req, res) {
  const { stockSymbol } = req.params;
  const { user } = req.body;

  if (!STOCK_BALANCES[user]) {
    STOCK_BALANCES[user] = {};
  }

  if (STOCK_BALANCES[user][stockSymbol]) {
    res.status(400).json({ msg: "Symbol already exists for this user." });
    return;
  }

  STOCK_BALANCES[user][stockSymbol] = {
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

  res.status(201).json({
    message: `Symbol ${stockSymbol} created`, // <- Ensure this is returned
    stockBalances: STOCK_BALANCES[user][stockSymbol],
    orderbook: ORDERBOOK[stockSymbol],
  });
}

function showStockBalance(req, res) {
  const stockBalances = Object.keys(STOCK_BALANCES).map((userId) => {
    return {
      userId,
      stockBalances: STOCK_BALANCES[userId] || {},
    };
  });
  res.status(201).json({
    stockBalances,
  });
}

function showInrBalance(req, res) {
  const inrBalance = Object.keys(INR_BALANCES).map((userId) => {
    return {
      userId,
      INR_BALANCES: INR_BALANCES[userId],
    };
  });
  res.status(201).json({
    inrBalance,
  });
}

function showAllUser(req, res) {
  const users = Object.keys(INR_BALANCES).map((userId) => {
    return {
      userId,
      inrBalance: INR_BALANCES[userId],
      stockBalances: STOCK_BALANCES[userId] || {},
    };
  });
  res.status(201).json({
    users,
  });
}
function showOrderbookBySymbol(req, res) {
  const { stockSymbol } = req.params;

  if (!stockSymbol) {
    res.status(400).json({
      msg: "stock symbol is required",
    });
    return;
  }

  if (!ORDERBOOK[stockSymbol]) {
    res.status(404).json({
      message: `Orderbook for symbol ${stockSymbol} not found.`,
    });
    return;
  }
  res.status(200).json({
    symbol: stockSymbol,
    orderbook: ORDERBOOK[stockSymbol],
  });
}

function userInrBalance(req, res) {
  const { userId } = req.params;
  const userBalance = INR_BALANCES[userId];
  if (!userBalance) {
    return res.status(404).json({
      message: `INR balance for user ${userId} not found.`,
    });
  }

  res.status(200).json({
    userId: userId,
    inrBalance: userBalance,
  });
}

function userStockBalance(req, res) {
  const { userId } = req.params;
  const userBalance = STOCK_BALANCES[userId];

  if (!userBalance) {
    return res.status(404).json({
      message: `Stock balance for user ${userId} not found.`,
    });
  }
  res.status(200).json({
    userId: userId,
    stockBalance: userBalance,
  });
}

function placeBuyOrder(req, res) {
  const { userId, stockSymbol, quantity, price, stockType } = req.body;

  // Validate input parameters
  if (stockType !== "yes" && stockType !== "no") {
    return res.status(400).json({
      status: "error",
      message: "Invalid stock type. Must be 'yes' or 'no'.",
    });
  }
  if (quantity <= 0 || price <= 0) {
    return res.status(400).json({
      status: "error",
      message: "Quantity and price must be positive numbers.",
    });
  }

  const totalCost = quantity * price;

  // Check if user has sufficient balance
  if (!INR_BALANCES[userId] || INR_BALANCES[userId].balance < totalCost) {
    return res
      .status(400)
      .json({ status: "error", message: "Insufficient INR balance." });
  }

  // Lock the INR balance for the buy order
  INR_BALANCES[userId].balance -= totalCost;
  INR_BALANCES[userId].locked += totalCost;

  // Ensure the order book is initialized
  if (!ORDERBOOK[stockSymbol]) {
    ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
  }

  let remainingQuantity = quantity;
  const oppositeType = stockType === "yes" ? "no" : "yes";

  // Attempt to match the buy order
  for (let existingPrice in ORDERBOOK[stockSymbol][stockType]) {
    existingPrice = parseFloat(existingPrice);

    // Check if the existing price is within acceptable range
    if (existingPrice > price || remainingQuantity <= 0) continue;

    const existingOrders = ORDERBOOK[stockSymbol][stockType][existingPrice];
    for (let existingUserId in existingOrders.orders) {
      if (remainingQuantity <= 0) break;

      // Avoid self-matching
      if (existingUserId === userId) continue;

      const availableQuantity = existingOrders.orders[existingUserId];
      const quantityToMatch = Math.min(availableQuantity, remainingQuantity);
      const matchCost = quantityToMatch * existingPrice;

      // Update balances for the matched user
      INR_BALANCES[existingUserId].locked -= matchCost;
      INR_BALANCES[existingUserId].balance += matchCost;

      // Update stock balances for both users
      STOCK_BALANCES[userId][stockSymbol] = STOCK_BALANCES[userId][
        stockSymbol
      ] || { yes: { quantity: 0 }, no: { quantity: 0 } };
      STOCK_BALANCES[existingUserId][stockSymbol][stockType].quantity -=
        quantityToMatch;
      STOCK_BALANCES[userId][stockSymbol][stockType].quantity +=
        quantityToMatch;

      // Update order book
      existingOrders.total -= quantityToMatch;
      existingOrders.orders[existingUserId] -= quantityToMatch;
      if (existingOrders.orders[existingUserId] <= 0) {
        delete existingOrders.orders[existingUserId];
      }

      remainingQuantity -= quantityToMatch;
    }

    // Clean up if no more orders remain at this price level
    if (existingOrders.total <= 0) {
      delete ORDERBOOK[stockSymbol][stockType][existingPrice];
    }
  }

  // Handle the remaining quantity (if any)
  if (remainingQuantity > 0) {
    const complementPrice = 10 - price;
    if (ORDERBOOK[stockSymbol][oppositeType][complementPrice]) {
      // Similar matching logic for "no" side...
    }
  }

  broadcastOrderBookUpdate(stockSymbol);

  res.status(200).json({
    status: "success",
    message: `Order placed. ${
      quantity - remainingQuantity
    } units were matched.`,
    orderbook: ORDERBOOK[stockSymbol],
    remainingQuantity,
  });
}

function placeSellOrder(req, res) {
  const { userId, stockSymbol, quantity, price, stockType } = req.body;

  // Validate stock type
  if (stockType !== "yes" && stockType !== "no") {
    return res.status(400).json({
      message: "Invalid stock type. Must be 'yes' or 'no'",
    });
  }

  // Validate quantity and price
  if (quantity <= 0 || price <= 0) {
    return res.status(400).json({
      message: "Quantity and price must be positive numbers.",
    });
  }

  // Check if the user has enough stock to sell
  if (
    !STOCK_BALANCES[userId] ||
    !STOCK_BALANCES[userId][stockSymbol] ||
    STOCK_BALANCES[userId][stockSymbol][stockType].quantity < quantity
  ) {
    return res.status(400).json({
      message: "Insufficient stock to sell.",
    });
  }

  // Lock the quantity to prevent it from being sold twice
  STOCK_BALANCES[userId][stockSymbol][stockType].locked += quantity;

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

  res.status(200).json({
    message: `Sell order placed for ${quantity} at price ${price}`,
    orderbook: ORDERBOOK[stockSymbol],
  });
}

function mintTokens(req, res) {
  const { userId, stockSymbol, quantity, stockType } = req.body;

  if (
    !userId ||
    !stockSymbol ||
    !quantity ||
    (stockType !== "yes" && stockType !== "no")
  ) {
    return res.status(400).json({ message: "Invalid input." });
  }

  STOCK_BALANCES[userId] = STOCK_BALANCES[userId] || {};
  STOCK_BALANCES[userId][stockSymbol] = STOCK_BALANCES[userId][stockSymbol] || {
    yes: { quantity: 0 },
    no: { quantity: 0 },
  };

  // Mint the specified quantity
  STOCK_BALANCES[userId][stockSymbol][stockType].quantity += quantity;

  res.status(200).json({
    message: `Minted ${quantity} ${stockType} tokens for ${stockSymbol}`,
    stockBalances: STOCK_BALANCES[userId][stockSymbol],
  });
}

function cancelOrder(req, res) {
  const { userId, stockSymbol, stockType, price } = req.body;

  // Check if the order exists in the order book
  if (
    !ORDERBOOK[stockSymbol] ||
    !ORDERBOOK[stockSymbol][stockType][price] ||
    !ORDERBOOK[stockSymbol][stockType][price].orders[userId]
  ) {
    return res
      .status(404)
      .json({ status: "error", message: "Order not found." });
  }

  const quantity = ORDERBOOK[stockSymbol][stockType][price].orders[userId];

  // Unlock balances based on the order type (buy or sell)
  if (stockType === "yes" || stockType === "no") {
    // For a buy order, unlock INR based on the remaining quantity
    const remainingLockedINR = quantity * price;
    INR_BALANCES[userId].locked -= remainingLockedINR;
    INR_BALANCES[userId].balance += remainingLockedINR;
  } else {
    // For a sell order, unlock the locked stock quantity
    STOCK_BALANCES[userId][stockSymbol][stockType].locked -= quantity;
  }

  // Remove the order from the order book
  ORDERBOOK[stockSymbol][stockType][price].total -= quantity;
  delete ORDERBOOK[stockSymbol][stockType][price].orders[userId];

  // Clean up the order book if there are no more orders at this price level
  if (ORDERBOOK[stockSymbol][stockType][price].total <= 0) {
    delete ORDERBOOK[stockSymbol][stockType][price];
  }

  res.status(200).json({
    status: "success",
    message: "Order canceled and balances unlocked.",
  });
}

module.exports = {
  resetData,
  createUser,
  onrampUser,
  createSymbol,
  showAllUser,
  showStockBalance,
  showInrBalance,
  showOrderbookBySymbol,
  userInrBalance,
  userStockBalance,
  placeBuyOrder,
  placeSellOrder,
  mintTokens,
  cancelOrder,
};
