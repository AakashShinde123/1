import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type UpdateProduct,
  type StockTransaction,
  type InsertStockTransaction,
  type StockTransactionWithDetails,
  type UserRole,
} from "@shared/schema";
import { 
  userQueries, 
  productQueries, 
  stockTransactionQueries, 
  dashboardQueries, 
  transactionHelpers 
} from "./queries";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, role: UserRole): Promise<User>;
  updateUserPassword(userId: number, password: string): Promise<User>;
  updateUserStatus(userId: number, isActive: boolean): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: UpdateProduct): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Stock transaction operations
  createStockTransaction(transaction: InsertStockTransaction): Promise<StockTransaction>;
  getStockTransactions(filters?: {
    productId?: number;
    type?: "stock_in" | "stock_out";
    userId?: number;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<StockTransactionWithDetails[]>;
  getDashboardStats(): Promise<{
    totalProducts: number;
    totalStock: number;
    todayStockIn: number;
    todayStockOut: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return await userQueries.getById(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await userQueries.getByUsername(username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    return await userQueries.create(userData);
  }

  async updateUserRole(userId: number, role: UserRole): Promise<User> {
    return await userQueries.updateRole(userId, role);
  }

  async updateUserPassword(userId: number, password: string): Promise<User> {
    return await userQueries.updatePassword(userId, password);
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    return await userQueries.updateStatus(userId, isActive);
  }

  async getUsers(): Promise<User[]> {
    return await userQueries.getAll();
  }

  async getProducts(): Promise<Product[]> {
    return await productQueries.getActive();
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return await productQueries.getById(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    return await productQueries.create(product);
  }

  async updateProduct(id: number, product: UpdateProduct): Promise<Product> {
    return await productQueries.update(id, product);
  }

  async deleteProduct(id: number): Promise<void> {
    await productQueries.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await productQueries.search(query);
  }

  // Stock transaction operations
  async createStockTransaction(transaction: any): Promise<StockTransaction> {
    const transactionDate = transaction.transactionDate || new Date();
    
    if (transaction.type === "stock_in") {
      const result = await transactionHelpers.processStockIn(
        transaction.productId,
        transaction.userId,
        transaction.quantity,
        transactionDate,
        transaction.remarks,
        transaction.poNumber
      );
      return result.transaction;
    } else {
      const result = await transactionHelpers.processStockOut(
        transaction.productId,
        transaction.userId,
        transaction.quantity,
        transactionDate,
        transaction.remarks,
        transaction.soNumber
      );
      return result.transaction;
    }
  }

  async getStockTransactions(filters?: {
    productId?: number;
    type?: "stock_in" | "stock_out";
    userId?: number;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<StockTransactionWithDetails[]> {
    return await stockTransactionQueries.getAllWithDetails(filters);
  }

  async getDashboardStats(): Promise<{
    totalProducts: number;
    totalStock: number;
    todayStockIn: number;
    todayStockOut: number;
  }> {
    const stats = await dashboardQueries.getStats();
    return {
      totalProducts: stats.totalProducts,
      totalStock: stats.totalStock,
      todayStockIn: stats.todayStockIn,
      todayStockOut: stats.todayStockOut,
    };
  }
}

export const storage = new DatabaseStorage();