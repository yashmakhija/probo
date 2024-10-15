const INR_BALANCES = {};

function onrampUser(req, res) {
  const { userId, amount } = req.body;

  if (!INR_BALANCES[userId]) {
    INR_BALANCES[userId] = { balance: 0, locked: 0 };
  }

  INR_BALANCES[userId].balance += amount;

  res.status(200).json({ message: `Onramped ${userId} with amount ${amount}` });
}

module.exports = { onrampUser };
