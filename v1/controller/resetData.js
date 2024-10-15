function resetData(req, res) {
  // Reset all data
  INR_BALANCES = {};
  ORDERBOOK = {};
  STOCK_BALANCES = {};

  res.status(200).json({ message: "All data has been reset." });
}

module.exports = { resetData };
