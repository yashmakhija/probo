import { Request, Response } from "express";
import services from "../services/userService";

// Controller for resetting data
export const resetData = async (_req: Request, res: Response) => {
  try {
    const result = await services.resetDataService();
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to reset data", error });
  }
};

// Controller for creating a user
export const createUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const result = await services.createUserService(userId);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error });
  }
};

// Controller for adding balance
export const addBalance = async (req: Request, res: Response) => {
  const { userId, amount } = req.body;
  if (!userId || amount == null) {
    res.status(400).json({ message: "userId and amount are required" });
    return;
  }
  try {
    const result = await services.addBalanceService(userId, amount);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to add balance", error });
  }
};

// Controller for creating a new stock symbol
export const createStockSymbol = async (req: Request, res: Response) => {
  const { stockSymbol } = req.params;
  try {
    const result = await services.createStockSymbolService(stockSymbol);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to create stock symbol", error });
  }
};

// Controller for fetching all stock balances
export const getAllStockBalances = async (_req: Request, res: Response) => {
  try {
    const result = await services.getAllStockBalancesService();
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stock balances", error });
  }
};

export const getAllInrBalances = async (_req: Request, res: Response) => {
  try {
    const result = await services.getAllInrBalancesService();
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stock balances", error });
  }
};

// Controller for fetching order book
export const getOrderBook = async (_req: Request, res: Response) => {
  try {
    const result = await services.getOrderBookService();
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order book", error });
  }
};

// Controller for fetching order book by stock symbol
export const getOrderBookBySymbol = async (req: Request, res: Response) => {
  const { stockSymbol } = req.params;
  try {
    const result = await services.getOrderBookBySymbolService(stockSymbol);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({
      message: `Failed to fetch order book for ${stockSymbol}`,
      error,
    });
  }
};

// Controller for fetching a user's INR balance
export const getUserInrBalance = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const result = await services.getUserBalanceService(userId);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch INR balance", error });
  }
};

// Controller for fetching a user's stock balance
export const getUserStockBalance = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const result = await services.getUserStockBalanceService(userId);
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stock balance", error });
  }
};

// Controller for placing a buy order
export const placeBuyOrder = async (req: Request, res: Response) => {
  const { userId, stockSymbol, quantity, price, stockOption } = req.body;
  if (!userId || !stockSymbol || !quantity || !price || !stockOption) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  try {
    const result = await services.placeBuyOrderService(
      userId,
      stockSymbol,
      quantity,
      price,
      stockOption
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to place buy order", error });
  }
};

// Controller for placing a sell order
export const placeSellOrder = async (req: Request, res: Response) => {
  const { userId, stockSymbol, quantity, price, stockOption } = req.body;
  if (!userId || !stockSymbol || !quantity || !price || !stockOption) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  try {
    const result = await services.placeSellOrderService(
      userId,
      stockSymbol,
      quantity,
      price,
      stockOption
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to place sell order", error });
  }
};

// Controller for minting tokens
export const mintToken = async (req: Request, res: Response) => {
  const { userId, stockSymbol, quantity } = req.body;
  if (!userId || !stockSymbol || quantity == null) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  try {
    const result = await services.mintTokenService(
      userId,
      stockSymbol,
      quantity
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to mint tokens", error });
  }
};

// Export all controllers
export default {
  resetData,
  createUser,
  addBalance,
  createStockSymbol,
  getAllStockBalances,
  getOrderBook,
  getOrderBookBySymbol,
  getUserInrBalance,
  getUserStockBalance,
  placeBuyOrder,
  placeSellOrder,
  mintToken,
  getAllInrBalances,
};
