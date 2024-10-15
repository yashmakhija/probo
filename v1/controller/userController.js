let INR_BALANCES = {};
let STOCK_BALANCES = {};
let ORDERBOOK = {};

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
    msg: `Symbol ${stockSymbol} created`,
    stockBalances: STOCK_BALANCES[user][stockSymbol],
    orderbook: ORDERBOOK[stockSymbol],
  });
  return;
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
function showOrderbook(req, res) {
  const { stockSymbol } = req.query;

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

module.exports = {
  resetData,
  createUser,
  onrampUser,
  createSymbol,
  showAllUser,
  showStockBalance,
  showInrBalance,
  showOrderbook,
  userInrBalance,
  userStockBalance,
};