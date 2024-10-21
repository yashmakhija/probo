import { Request, Response } from "express";
import services from "../services/userService";

// Controller for reset data
export const resetData = async (req: Request, res: Response) => {
  const result = await services.resetDataService();
  res.status(result.status).json(result.data);
  return;
};

// Controller for creating a user
export const createUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await services.createUserService(userId);
  res.status(result.status).json(result.data);
  return;
};

// Controller for adding balance
export const addBalance = async (req: Request, res: Response) => {
  const { userId, amount } = req.body;
  const result = await services.addBalanceService(userId, amount);
  res.status(result.status).json(result.data);
  return;
};

// Controller for creating a new stock symbol
export const newSymbol = async (req: Request, res: Response) => {
  const stockSymbol = req.params.stockSymbol;
  const userId = req.body.userId;
  const result = await services.newSymbolService(userId, stockSymbol);
  res.status(result.status).json(result.data);
  return;
};

// Controller for fetching stock balances
export const stockBalance = async (req: Request, res: Response) => {
  const result = await services.stockBalanceService();
  res.status(result.status).json(result.data);
  return;
};

// Controller for fetching INR balances
export const inrBalance = async (req: Request, res: Response) => {
  const result = await services.inrBalanceService();
  res.status(result.status).json(result.data);
  return;
};

// Controller for showing all users
export const showAllUser = async (req: Request, res: Response) => {
  const result = await services.showAllUserService();
  res.status(result.status).json(result.data);
  return;
};

// Controller for showing order book by stock symbol
export const showOrderBookSymbol = async (req: Request, res: Response) => {
  const stockSymbol = req.params.stockSymbol;
  const result = await services.showOrderBookSymbolService(stockSymbol);
  res.status(result.status).json(result.data);
  return;
};

// Controller for getting a user's INR balance
export const userInrBalance = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await services.userInrBalanceService(userId);
  if (!result) {
    // Handle the case where the service did not return a result
    res.status(500).json({ message: "An unexpected error occurred" });
    return;
  }
  res.status(result.status).json(result.data);
  return;
};

// Controller for getting a user's stock balance
export const userStockBalance = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await services.userStockBalanceService(userId);
  if (!result) {
    // Handle the case where the service did not return a result
    res.status(500).json({ message: "An unexpected error occurred" });
    return;
  }
  res.status(result.status).json(result.data);
  return;
};

// Controller for minting tokens
export const mintToken = async (req: Request, res: Response) => {
  const { userId, stockSymbol, quantity } = req.body;
  const result = await services.mintTokenService(userId, stockSymbol, quantity);
  res.status(result.status).json(result.data);
  return;
};

// Controller for placing a buy order
export const placeBuyOrder = async (req: Request, res: Response) => {
  const { userId, stockSymbol, quantity, price, stockType } = req.body;
  const result = await services.placeBuyOrderService(
    userId,
    stockSymbol,
    quantity,
    price,
    stockType
  );

  if (!result) {
    // Handle the case where the service did not return a result
    res.status(500).json({ message: "An unexpected error occurred" });
    return;
  }

  res.status(result.status).json(result.data);
  return;
};

// Controller for placing a sell order
export const placeSellOrder = async (req: Request, res: Response) => {
  const { userId, stockSymbol, quantity, price, stockType } = req.body;
  const result = await services.placeSellOrderService(
    userId,
    stockSymbol,
    quantity,
    price,
    stockType
  );

  if (!result) {
    // Handle the case where the service did not return a result
    res.status(500).json({ message: "An unexpected error occurred" });
    return;
  }

  res.status(result.status).json(result.data);
  return;
};

// Export all controllers
export default {
  resetData,
  createUser,
  addBalance,
  newSymbol,
  stockBalance,
  inrBalance,
  showAllUser,
  showOrderBookSymbol,
  userInrBalance,
  userStockBalance,
  mintToken,
  placeBuyOrder,
  placeSellOrder,
};
