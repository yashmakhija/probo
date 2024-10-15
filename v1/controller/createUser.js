const INR_BALANCES = {};

function createUser(req, res) {
  const userId = req.params.userId;

  if (INR_BALANCES[userId]) {
    res.status(400).json({ message: "User already exists." });
    return;
  }
  INR_BALANCES[userId] = { balance: 0, locked: 0 };
  res.status(201).json({ message: "User created.", userId });
}

module.exports = { createUser };
