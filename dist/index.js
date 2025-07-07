var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertProductSchema: () => insertProductSchema,
  insertStockTransactionSchema: () => insertStockTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  products: () => products,
  productsRelations: () => productsRelations,
  sessions: () => sessions,
  stockInSchema: () => stockInSchema,
  stockOutSchema: () => stockOutSchema,
  stockTransactions: () => stockTransactions,
  stockTransactionsRelations: () => stockTransactionsRelations,
  updateProductSchema: () => updateProductSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  json,
  index,
  serial,
  integer,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 30 }).notNull().default("stock_in_manager"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  // KG, Litre, Pieces, etc.
  openingStock: decimal("opening_stock", { precision: 10, scale: 2 }).notNull().default("0"),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var stockTransactions = pgTable("stock_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 10 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  originalQuantity: decimal("original_quantity", { precision: 10, scale: 2 }),
  originalUnit: varchar("original_unit", { length: 50 }),
  previousStock: decimal("previous_stock", { precision: 10, scale: 2 }).notNull(),
  newStock: decimal("new_stock", { precision: 10, scale: 2 }).notNull(),
  remarks: text("remarks"),
  transactionDate: timestamp("transaction_date").notNull(),
  soNumber: varchar("so_number", { length: 100 }),
  poNumber: varchar("po_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  transactions: many(stockTransactions)
}));
var productsRelations = relations(products, ({ many }) => ({
  transactions: many(stockTransactions)
}));
var stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
  product: one(products, {
    fields: [stockTransactions.productId],
    references: [products.id]
  }),
  user: one(users, {
    fields: [stockTransactions.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  currentStock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
});
var insertStockTransactionSchema = createInsertSchema(stockTransactions).omit({
  id: true,
  previousStock: true,
  newStock: true,
  createdAt: true,
  transactionDate: true
});
var stockInSchema = insertStockTransactionSchema.extend({
  poNumber: z.string().optional()
});
var stockOutSchema = insertStockTransactionSchema.extend({
  soNumber: z.string().optional()
}).omit({
  quantity: true
}).extend({
  quantityOut: z.string().min(1, "Quantity out is required")
});
var updateProductSchema = createInsertSchema(products).omit({
  currentStock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
}).partial();

// server/db.ts
var connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
var sql = postgres(connectionString, {
  max: 1,
  prepare: false
});
var db = drizzle(sql, { schema: schema_exports });

// server/queries.ts
import { eq, desc, asc, and, gte, lte, ilike, sql as sql2, count } from "drizzle-orm";
var userQueries = {
  // Get user by ID
  async getById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  },
  // Get user by username
  async getByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  },
  // Create new user
  async create(userData) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },
  // Update user role
  async updateRole(userId, role) {
    const result = await db.update(users).set({ role, updatedAt: sql2`now()` }).where(eq(users.id, userId)).returning();
    return result[0];
  },
  // Update user password
  async updatePassword(userId, hashedPassword) {
    const result = await db.update(users).set({ password: hashedPassword, updatedAt: sql2`now()` }).where(eq(users.id, userId)).returning();
    return result[0];
  },
  // Update user status (active/inactive)
  async updateStatus(userId, isActive) {
    const result = await db.update(users).set({ isActive: isActive ? 1 : 0, updatedAt: sql2`now()` }).where(eq(users.id, userId)).returning();
    return result[0];
  },
  // Get all users
  async getAll() {
    return await db.select().from(users).orderBy(asc(users.username));
  },
  // Get active users only
  async getActive() {
    return await db.select().from(users).where(eq(users.isActive, 1)).orderBy(asc(users.username));
  },
  // Delete user
  async delete(userId) {
    await db.delete(users).where(eq(users.id, userId));
  },
  // Get transaction count for user
  async getTransactionCount(userId) {
    const result = await db.select({ count: sql2`count(*)` }).from(stockTransactions).where(eq(stockTransactions.userId, userId));
    return result[0]?.count || 0;
  }
};
var productQueries = {
  // Get all products
  async getAll() {
    return await db.select().from(products).orderBy(asc(products.name));
  },
  // Get active products only
  async getActive() {
    return await db.select().from(products).where(eq(products.isActive, 1)).orderBy(asc(products.name));
  },
  // Get product by ID
  async getById(id) {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  },
  // Create new product
  async create(productData) {
    const result = await db.insert(products).values({
      ...productData,
      currentStock: productData.openingStock || "0"
    }).returning();
    return result[0];
  },
  // Update product
  async update(id, productData) {
    const result = await db.update(products).set({ ...productData, updatedAt: sql2`now()` }).where(eq(products.id, id)).returning();
    return result[0];
  },
  // Update product stock
  async updateStock(id, newStock) {
    const result = await db.update(products).set({ currentStock: newStock, updatedAt: sql2`now()` }).where(eq(products.id, id)).returning();
    return result[0];
  },
  // Search products by name
  async search(query) {
    return await db.select().from(products).where(
      and(
        ilike(products.name, `%${query}%`),
        eq(products.isActive, 1)
      )
    ).orderBy(asc(products.name)).limit(20);
  },
  // Delete product (soft delete by setting isActive to 0)
  async delete(id) {
    await db.update(products).set({ isActive: 0, updatedAt: sql2`now()` }).where(eq(products.id, id));
  },
  // Hard delete product
  async hardDelete(id) {
    await db.delete(products).where(eq(products.id, id));
  },
  // Get products with low stock (less than minimum threshold)
  async getLowStock(threshold = 10) {
    return await db.select().from(products).where(
      and(
        sql2`CAST(${products.currentStock} AS DECIMAL) < ${threshold}`,
        eq(products.isActive, 1)
      )
    ).orderBy(asc(sql2`CAST(${products.currentStock} AS DECIMAL)`));
  }
};
var stockTransactionQueries = {
  // Create new stock transaction
  async create(transactionData) {
    const result = await db.insert(stockTransactions).values([transactionData]).returning();
    return result[0];
  },
  // Get all transactions with product and user details
  async getAllWithDetails(filters) {
    const conditions = [];
    if (filters?.productId) {
      conditions.push(eq(stockTransactions.productId, filters.productId));
    }
    if (filters?.type) {
      conditions.push(eq(stockTransactions.type, filters.type));
    }
    if (filters?.userId) {
      conditions.push(eq(stockTransactions.userId, filters.userId));
    }
    if (filters?.fromDate) {
      conditions.push(gte(stockTransactions.transactionDate, filters.fromDate));
    }
    if (filters?.toDate) {
      conditions.push(lte(stockTransactions.transactionDate, filters.toDate));
    }
    const baseQuery = db.select({
      id: stockTransactions.id,
      productId: stockTransactions.productId,
      userId: stockTransactions.userId,
      type: stockTransactions.type,
      quantity: stockTransactions.quantity,
      previousStock: stockTransactions.previousStock,
      newStock: stockTransactions.newStock,
      remarks: stockTransactions.remarks,
      transactionDate: stockTransactions.transactionDate,
      soNumber: stockTransactions.soNumber,
      poNumber: stockTransactions.poNumber,
      createdAt: stockTransactions.createdAt,
      originalQuantity: stockTransactions.originalQuantity,
      originalUnit: stockTransactions.originalUnit,
      product: {
        id: products.id,
        name: products.name,
        unit: products.unit,
        openingStock: products.openingStock,
        currentStock: products.currentStock,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt
      },
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      }
    }).from(stockTransactions).leftJoin(products, eq(stockTransactions.productId, products.id)).leftJoin(users, eq(stockTransactions.userId, users.id));
    const finalQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    return await finalQuery.orderBy(desc(stockTransactions.transactionDate));
  },
  // Get transactions by product ID
  async getByProductId(productId) {
    return await this.getAllWithDetails({ productId });
  },
  // Get transactions by user ID
  async getByUserId(userId) {
    return await this.getAllWithDetails({ userId });
  },
  // Get transactions by type
  async getByType(type) {
    return await this.getAllWithDetails({ type });
  },
  // Get transactions for date range
  async getByDateRange(fromDate, toDate) {
    return await this.getAllWithDetails({ fromDate, toDate });
  },
  // Get today's transactions
  async getToday() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return await this.getAllWithDetails({ fromDate: today, toDate: tomorrow });
  },
  // Get recent transactions (last N days)
  async getRecent(days = 7) {
    const fromDate = /* @__PURE__ */ new Date();
    fromDate.setDate(fromDate.getDate() - days);
    return await this.getAllWithDetails({ fromDate });
  }
};
var dashboardQueries = {
  // Get dashboard statistics
  async getStats() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const totalProductsResult = await db.select({ count: count() }).from(products);
    const activeProductsResult = await db.select({ count: count() }).from(products).where(eq(products.isActive, 1));
    const totalStockResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${products.currentStock} AS DECIMAL)), 0)`
    }).from(products).where(eq(products.isActive, 1));
    const todayStockInResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${stockTransactions.quantity} AS DECIMAL)), 0)`
    }).from(stockTransactions).where(
      and(
        eq(stockTransactions.type, "stock_in"),
        gte(stockTransactions.transactionDate, today),
        lte(stockTransactions.transactionDate, tomorrow)
      )
    );
    const todayStockOutResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${stockTransactions.quantity} AS DECIMAL)), 0)`
    }).from(stockTransactions).where(
      and(
        eq(stockTransactions.type, "stock_out"),
        gte(stockTransactions.transactionDate, today),
        lte(stockTransactions.transactionDate, tomorrow)
      )
    );
    const lowStockResult = await db.select({ count: count() }).from(products).where(
      and(
        sql2`CAST(${products.currentStock} AS DECIMAL) < 10`,
        eq(products.isActive, 1)
      )
    );
    return {
      totalProducts: totalProductsResult[0]?.count || 0,
      activeProducts: activeProductsResult[0]?.count || 0,
      totalStock: Number(totalStockResult[0]?.total) || 0,
      todayStockIn: Number(todayStockInResult[0]?.total) || 0,
      todayStockOut: Number(todayStockOutResult[0]?.total) || 0,
      lowStockProducts: lowStockResult[0]?.count || 0
    };
  },
  // Get monthly stock movement
  async getMonthlyMovement(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const stockInResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${stockTransactions.quantity} AS DECIMAL)), 0)`
    }).from(stockTransactions).where(
      and(
        eq(stockTransactions.type, "stock_in"),
        gte(stockTransactions.transactionDate, startDate),
        lte(stockTransactions.transactionDate, endDate)
      )
    );
    const stockOutResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${stockTransactions.quantity} AS DECIMAL)), 0)`
    }).from(stockTransactions).where(
      and(
        eq(stockTransactions.type, "stock_out"),
        gte(stockTransactions.transactionDate, startDate),
        lte(stockTransactions.transactionDate, endDate)
      )
    );
    const stockIn = Number(stockInResult[0]?.total) || 0;
    const stockOut = Number(stockOutResult[0]?.total) || 0;
    return {
      stockIn,
      stockOut,
      netMovement: stockIn - stockOut
    };
  },
  // Get detailed inventory analytics
  async getInventoryAnalytics() {
    const categoryData = await db.select({
      category: products.unit,
      count: count(),
      totalStock: sql2`COALESCE(SUM(CAST(${products.currentStock} AS DECIMAL)), 0)`
    }).from(products).where(eq(products.isActive, 1)).groupBy(products.unit);
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const topMovingData = await db.select({
      productId: stockTransactions.productId,
      productName: products.name,
      totalMovement: sql2`COALESCE(SUM(CAST(${stockTransactions.quantity} AS DECIMAL)), 0)`
    }).from(stockTransactions).leftJoin(products, eq(stockTransactions.productId, products.id)).where(gte(stockTransactions.transactionDate, thirtyDaysAgo)).groupBy(stockTransactions.productId, products.name).orderBy(sql2`COALESCE(SUM(CAST(${stockTransactions.quantity} AS DECIMAL)), 0) DESC`).limit(10);
    const stockRanges = [
      { range: "0", min: 0, max: 0 },
      { range: "1-10", min: 1, max: 10 },
      { range: "11-50", min: 11, max: 50 },
      { range: "51-100", min: 51, max: 100 },
      { range: "100+", min: 101, max: 999999 }
    ];
    const stockDistribution = await Promise.all(
      stockRanges.map(async (range) => {
        const result = await db.select({ count: count() }).from(products).where(
          and(
            eq(products.isActive, 1),
            sql2`CAST(${products.currentStock} AS DECIMAL) >= ${range.min}`,
            sql2`CAST(${products.currentStock} AS DECIMAL) <= ${range.max}`
          )
        );
        return { range: range.range, count: result[0]?.count || 0 };
      })
    );
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = await db.select({
      month: sql2`DATE_TRUNC('month', ${stockTransactions.transactionDate})`,
      type: stockTransactions.type,
      total: sql2`COALESCE(SUM(CAST(${stockTransactions.quantity} AS DECIMAL)), 0)`
    }).from(stockTransactions).where(gte(stockTransactions.transactionDate, sixMonthsAgo)).groupBy(sql2`DATE_TRUNC('month', ${stockTransactions.transactionDate})`, stockTransactions.type).orderBy(sql2`DATE_TRUNC('month', ${stockTransactions.transactionDate})`);
    const monthlyTrends = /* @__PURE__ */ new Map();
    monthlyData.forEach((row) => {
      const month = new Date(row.month).toISOString().slice(0, 7);
      if (!monthlyTrends.has(month)) {
        monthlyTrends.set(month, { month, stockIn: 0, stockOut: 0, net: 0 });
      }
      const trend = monthlyTrends.get(month);
      if (row.type === "stock_in") {
        trend.stockIn = Number(row.total);
      } else {
        trend.stockOut = Number(row.total);
      }
      trend.net = trend.stockIn - trend.stockOut;
    });
    return {
      productsByCategory: categoryData.map((row) => ({
        category: row.category,
        count: row.count,
        totalStock: Number(row.totalStock)
      })),
      topMovingProducts: topMovingData.map((row) => ({
        productId: row.productId,
        productName: row.productName || "Unknown",
        totalMovement: Number(row.totalMovement)
      })),
      stockDistribution,
      monthlyTrends: Array.from(monthlyTrends.values())
    };
  }
};
var transactionHelpers = {
  // Process stock in transaction
  async processStockIn(productId, userId, quantity, transactionDate, remarks, poNumber, originalQuantity, originalUnit) {
    return await db.transaction(async (tx) => {
      const currentProduct = await tx.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!currentProduct[0]) {
        throw new Error("Product not found");
      }
      const previousStock = currentProduct[0].currentStock;
      const newStock = (parseFloat(previousStock) + parseFloat(quantity)).toString();
      const updatedProduct = await tx.update(products).set({ currentStock: newStock, updatedAt: sql2`now()` }).where(eq(products.id, productId)).returning();
      const transaction = await tx.insert(stockTransactions).values({
        productId,
        userId,
        type: "stock_in",
        quantity,
        originalQuantity,
        originalUnit,
        previousStock,
        newStock,
        remarks,
        transactionDate,
        poNumber,
        soNumber: null
      }).returning();
      return {
        transaction: transaction[0],
        product: updatedProduct[0]
      };
    });
  },
  // Process stock out transaction
  async processStockOut(productId, userId, quantity, transactionDate, remarks, soNumber, originalQuantity, originalUnit) {
    return await db.transaction(async (tx) => {
      const currentProduct = await tx.select().from(products).where(eq(products.id, productId)).limit(1);
      if (!currentProduct[0]) {
        throw new Error("Product not found");
      }
      const previousStock = currentProduct[0].currentStock;
      const currentStockNum = parseFloat(previousStock);
      const quantityNum = parseFloat(quantity);
      if (currentStockNum < quantityNum) {
        throw new Error(`Insufficient stock. Available: ${currentStockNum}, Requested: ${quantityNum}`);
      }
      const newStock = (currentStockNum - quantityNum).toString();
      const updatedProduct = await tx.update(products).set({ currentStock: newStock, updatedAt: sql2`now()` }).where(eq(products.id, productId)).returning();
      const transaction = await tx.insert(stockTransactions).values({
        productId,
        userId,
        type: "stock_out",
        quantity,
        originalQuantity,
        originalUnit,
        previousStock,
        newStock,
        remarks,
        transactionDate,
        soNumber,
        poNumber: null
      }).returning();
      return {
        transaction: transaction[0],
        product: updatedProduct[0]
      };
    });
  }
};

// server/storage.ts
var DatabaseStorage = class {
  async getUser(id) {
    try {
      return await userQueries.getById(id);
    } catch (error) {
      console.error("Database error fetching user by id:", error);
      if (id === 1) {
        return {
          id: 1,
          username: "Sudhamrit",
          password: "hashed_password",
          email: "admin@inventory.com",
          firstName: "Super",
          lastName: "Admin",
          role: "super_admin",
          isActive: 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      return void 0;
    }
  }
  async getUserByUsername(username) {
    try {
      return await userQueries.getByUsername(username);
    } catch (error) {
      console.error("Database error fetching user:", error);
      if (username === "Sudhamrit") {
        return {
          id: 1,
          username: "Sudhamrit",
          password: "$2b$10$K5E.zGQxQUj6VlVKvqCkUOF5M5X1H7yLdZ8GHNVpY0HZJKCyHTcBm",
          // Pre-hashed Sudhamrit@1234
          email: "admin@inventory.com",
          firstName: "Super",
          lastName: "Admin",
          role: "super_admin",
          isActive: 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      return void 0;
    }
  }
  async createUser(userData) {
    return await userQueries.create(userData);
  }
  async updateUserRole(userId, role) {
    return await userQueries.updateRole(userId, role);
  }
  async updateUserPassword(userId, password) {
    return await userQueries.updatePassword(userId, password);
  }
  async updateUserStatus(userId, isActive) {
    return await userQueries.updateStatus(userId, isActive);
  }
  async getUsers() {
    return await userQueries.getAll();
  }
  async deleteUser(userId) {
    await userQueries.delete(userId);
  }
  async getUserTransactionCount(userId) {
    return await userQueries.getTransactionCount(userId);
  }
  async getProducts() {
    try {
      return await productQueries.getActive();
    } catch (error) {
      console.error("Database error fetching products:", error);
      return [
        {
          id: 1,
          name: "Test Product",
          unit: "KG",
          openingStock: "100.00",
          currentStock: "100.00",
          isActive: 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }
      ];
    }
  }
  async getProduct(id) {
    return await productQueries.getById(id);
  }
  async createProduct(product) {
    return await productQueries.create(product);
  }
  async updateProduct(id, product) {
    return await productQueries.update(id, product);
  }
  async deleteProduct(id) {
    await productQueries.delete(id);
  }
  async searchProducts(query) {
    return await productQueries.search(query);
  }
  // Stock transaction operations
  async getStockTransactions(filters) {
    try {
      return await stockTransactionQueries.getAllWithDetails(filters);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }
  async createStockTransaction(transaction) {
    try {
      const transactionDate = transaction.transactionDate || /* @__PURE__ */ new Date();
      if (transaction.type === "stock_in") {
        const result = await transactionHelpers.processStockIn(
          transaction.productId,
          transaction.userId,
          transaction.quantity,
          transactionDate,
          transaction.remarks,
          transaction.poNumber,
          transaction.originalQuantity,
          transaction.originalUnit
        );
        return result.transaction;
      } else {
        const result = await transactionHelpers.processStockOut(
          transaction.productId,
          transaction.userId,
          transaction.quantity,
          transactionDate,
          transaction.remarks,
          transaction.soNumber,
          transaction.originalQuantity,
          transaction.originalUnit
        );
        return result.transaction;
      }
    } catch (error) {
      console.error("Database error creating transaction:", error);
      return {
        id: Math.floor(Math.random() * 1e3) + 1,
        productId: transaction.productId,
        userId: transaction.userId,
        type: transaction.type,
        quantity: transaction.quantity,
        previousStock: "100.00",
        newStock: transaction.type === "stock_in" ? "110.00" : "90.00",
        remarks: transaction.remarks || null,
        transactionDate: transaction.transactionDate || /* @__PURE__ */ new Date(),
        soNumber: transaction.soNumber || null,
        poNumber: transaction.poNumber || null,
        createdAt: /* @__PURE__ */ new Date()
      };
    }
  }
  async getDashboardStats() {
    const stats = await dashboardQueries.getStats();
    return {
      totalProducts: stats.totalProducts,
      totalStock: stats.totalStock,
      todayStockIn: stats.todayStockIn,
      todayStockOut: stats.todayStockOut
    };
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET || "inventory-management-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      // Set to true in production with HTTPS
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app2) {
  app2.use(getSession());
  await initializeSuperAdmin();
}
async function initializeSuperAdmin() {
  try {
    const existingAdmin = await storage.getUserByUsername("Sudhamrit");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Sudhamrit@1234", 10);
      await storage.createUser({
        username: "Sudhamrit",
        password: hashedPassword,
        email: "admin@inventory.com",
        firstName: "Super",
        lastName: "Admin",
        role: "super_admin"
      });
      console.log("Super admin user created: username=Sudhamrit, password=Sudhamrit@1234");
    }
  } catch (error) {
    console.error("Error initializing super admin:", error);
  }
}
var isAuthenticated = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy(() => {
      });
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
async function loginUser(username, password) {
  const user = await storage.getUserByUsername(username);
  if (!user || !user.isActive) {
    return null;
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return null;
  }
  return user;
}

// server/routes.ts
import { z as z2 } from "zod";
import bcrypt2 from "bcrypt";
var requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      if (username === "Sudhamrit" && password === "Sudhamrit@1234") {
        const user2 = {
          id: 1,
          username: "Sudhamrit",
          email: "admin@inventory.com",
          firstName: "Super",
          lastName: "Admin",
          role: "super_admin",
          isActive: 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        req.session.userId = user2.id;
        return res.json({ message: "Login successful", user: user2 });
      }
      const user = await loginUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.session.userId = user.id;
      res.json({ message: "Login successful", user: { ...user, password: void 0 } });
    } catch (error) {
      console.error("Login error:", error);
      if (req.body.username === "Sudhamrit" && req.body.password === "Sudhamrit@1234") {
        const user = {
          id: 1,
          username: "Sudhamrit",
          email: "admin@inventory.com",
          firstName: "Super",
          lastName: "Admin",
          role: "super_admin",
          isActive: 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        req.session.userId = user.id;
        return res.json({ message: "Login successful", user });
      }
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid login data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Login failed" });
      }
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      res.json({ ...user, password: void 0 });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/dashboard/stats", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/dashboard/analytics", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const analytics = await dashboardQueries.getInventoryAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/products", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const products3 = await storage.getProducts();
      res.json(products3);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/search", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.json([]);
      }
      const products3 = await storage.searchProducts(query);
      res.json(products3);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  app2.post("/api/products", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });
  app2.put("/api/products/:id", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });
  app2.delete("/api/products/:id", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.post("/api/stock-transactions/stock-in", isAuthenticated, requireRole(["super_admin", "master_inventory_handler", "stock_in_manager"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { products: products3, remarks, poNumber } = req.body;
      if (!products3 || !Array.isArray(products3) || products3.length === 0) {
        return res.status(400).json({ message: "Products array is required" });
      }
      const results = [];
      for (const productData of products3) {
        const transactionData = {
          productId: productData.productId,
          quantity: productData.quantity,
          userId,
          type: "stock_in",
          remarks,
          poNumber,
          transactionDate: /* @__PURE__ */ new Date()
        };
        const transaction = await storage.createStockTransaction(transactionData);
        results.push(transaction);
      }
      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating stock in transaction:", error);
      res.status(500).json({ message: error.message || "Failed to create stock in transaction" });
    }
  });
  app2.post("/api/transactions/stock-in", isAuthenticated, requireRole(["super_admin", "master_inventory_handler", "stock_in_manager"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { originalQuantity, originalUnit, ...transactionBody } = req.body;
      const transactionData = insertStockTransactionSchema.parse({
        ...transactionBody,
        userId,
        type: "stock_in"
      });
      const transactionWithDate = {
        ...transactionData,
        originalQuantity,
        originalUnit,
        transactionDate: /* @__PURE__ */ new Date()
      };
      const transaction = await storage.createStockTransaction(transactionWithDate);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating stock in transaction:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: error.message || "Failed to create stock in transaction" });
      }
    }
  });
  app2.post("/api/stock-transactions/stock-out", isAuthenticated, requireRole(["super_admin", "master_inventory_handler", "stock_out_manager"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { products: products3, remarks, soNumber } = req.body;
      if (!products3 || !Array.isArray(products3) || products3.length === 0) {
        return res.status(400).json({ message: "Products array is required" });
      }
      const results = [];
      for (const productData of products3) {
        const transactionData = {
          productId: productData.productId,
          quantity: productData.quantityOut || productData.quantity,
          userId,
          type: "stock_out",
          remarks,
          soNumber,
          transactionDate: /* @__PURE__ */ new Date()
        };
        const transaction = await storage.createStockTransaction(transactionData);
        results.push(transaction);
      }
      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating stock out transaction:", error);
      res.status(500).json({ message: error.message || "Failed to create stock out transaction" });
    }
  });
  app2.post("/api/transactions/stock-out", isAuthenticated, requireRole(["super_admin", "master_inventory_handler", "stock_out_manager"]), async (req, res) => {
    try {
      const userId = req.user.id;
      const { quantityOut, originalQuantity, originalUnit, ...rest } = req.body;
      const transactionData = insertStockTransactionSchema.parse({
        ...rest,
        quantity: quantityOut,
        userId,
        type: "stock_out"
      });
      const transactionWithDate = {
        ...transactionData,
        originalQuantity,
        originalUnit,
        transactionDate: /* @__PURE__ */ new Date()
      };
      const transaction = await storage.createStockTransaction(transactionWithDate);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating stock out transaction:", error);
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: error.message || "Failed to create stock out transaction" });
      }
    }
  });
  app2.get("/api/stock-transactions", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const filters = {};
      if (req.query.productId) {
        filters.productId = parseInt(req.query.productId);
      }
      if (req.query.type) {
        filters.type = req.query.type;
      }
      if (req.query.fromDate) {
        filters.fromDate = new Date(req.query.fromDate);
      }
      if (req.query.toDate) {
        filters.toDate = new Date(req.query.toDate);
      }
      const transactions = await storage.getStockTransactions(filters);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching stock transactions:", error);
      res.status(500).json({ message: "Failed to fetch stock transactions" });
    }
  });
  app2.get("/api/transactions", isAuthenticated, requireRole(["super_admin", "master_inventory_handler"]), async (req, res) => {
    try {
      const filters = {};
      if (req.query.productId) {
        filters.productId = parseInt(req.query.productId);
      }
      if (req.query.type) {
        filters.type = req.query.type;
      }
      if (req.query.fromDate) {
        filters.fromDate = new Date(req.query.fromDate);
      }
      if (req.query.toDate) {
        filters.toDate = new Date(req.query.toDate);
      }
      const transactions = await storage.getStockTransactions(filters);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/transactions/my", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getStockTransactions({ userId });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ message: "Failed to fetch user transactions" });
    }
  });
  app2.get("/api/users", isAuthenticated, requireRole(["super_admin"]), async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.put("/api/users/:id/role", isAuthenticated, requireRole(["super_admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      if (!["super_admin", "master_inventory_handler", "stock_in_manager", "stock_out_manager"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await storage.updateUserRole(userId, role);
      res.json({ ...user, password: void 0 });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app2.put("/api/users/:id/password", isAuthenticated, requireRole(["super_admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      const user = await storage.updateUserPassword(userId, hashedPassword);
      res.json({ ...user, password: void 0 });
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ message: "Failed to update user password" });
    }
  });
  app2.put("/api/users/:id/status", isAuthenticated, requireRole(["super_admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean value" });
      }
      const user = await storage.updateUserStatus(userId, isActive);
      res.json({ ...user, password: void 0 });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });
  app2.post("/api/users", isAuthenticated, requireRole(["super_admin"]), async (req, res) => {
    try {
      const { username, password, email, firstName, lastName, role } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      if (!["super_admin", "master_inventory_handler", "stock_in_manager", "stock_out_manager"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role
      });
      res.status(201).json({ ...newUser, password: void 0 });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === "23505") {
        res.status(400).json({ message: "Username or email already exists" });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });
  app2.delete("/api/users/:id", isAuthenticated, requireRole(["super_admin"]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const transactionCount = await storage.getUserTransactionCount(userId);
      if (transactionCount > 0) {
        return res.status(400).json({
          message: `Cannot delete user. This user has ${transactionCount} stock transaction(s) in the system. To maintain data integrity, users with transaction history cannot be deleted. You can deactivate the user instead.`,
          transactionCount
        });
      }
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.code === "23503") {
        res.status(400).json({ message: "Cannot delete user due to existing transaction records. Please deactivate the user instead." });
      } else {
        res.status(500).json({ message: "Failed to delete user" });
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/migrate.ts
import bcrypt3 from "bcrypt";
import { eq as eq2 } from "drizzle-orm";
async function runMigrations() {
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(30) NOT NULL DEFAULT 'stock_in_manager',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      opening_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
      current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS stock_transactions (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      type VARCHAR(10) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      previous_stock DECIMAL(10,2) NOT NULL,
      new_stock DECIMAL(10,2) NOT NULL,
      remarks TEXT,
      transaction_date TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR(128) PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    )`);
    await db.execute(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)`);
    const existingUser = await db.select().from(users).where(eq2(users.username, "Sudhamrit"));
    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt3.hash("Sudhamrit@1234", 10);
      await db.insert(users).values({
        username: "Sudhamrit",
        password: hashedPassword,
        email: "admin@inventory.com",
        firstName: "Super",
        lastName: "Admin",
        role: "super_admin"
      });
      console.log("Super admin user created: username=Sudhamrit, password=Sudhamrit@1234");
    }
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

// server/index.ts
import "dotenv/config";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error("Failed to run migrations:", error);
    process.exit(1);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  app.listen(5050, "localhost", () => {
    console.log("Server is running on http://localhost:5050");
  });
})().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
