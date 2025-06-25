import {
  pgTable,
  text,
  varchar,
  timestamp,
  json,
  index,
  serial,
  integer,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid", { length: 128 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 30 }).notNull().default("stock_in_manager"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // KG, Litre, Pieces, etc.
  openingStock: decimal("opening_stock", { precision: 10, scale: 2 }).notNull().default("0"),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock transactions table
export const stockTransactions = pgTable("stock_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 10 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  previousStock: decimal("previous_stock", { precision: 10, scale: 2 }).notNull(),
  newStock: decimal("new_stock", { precision: 10, scale: 2 }).notNull(),
  remarks: text("remarks"),
  transactionDate: timestamp("transaction_date").notNull(),
  soNumber: varchar("so_number", { length: 100 }),
  poNumber: varchar("po_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(stockTransactions),
}));

export const productsRelations = relations(products, ({ many }) => ({
  transactions: many(stockTransactions),
}));

export const stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
  product: one(products, {
    fields: [stockTransactions.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [stockTransactions.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  currentStock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockTransactionSchema = createInsertSchema(stockTransactions).omit({
  id: true,
  previousStock: true,
  newStock: true,
  createdAt: true,
  transactionDate: true,
});

export const stockInSchema = insertStockTransactionSchema.extend({
  poNumber: z.string().optional(),
});

export const stockOutSchema = insertStockTransactionSchema.extend({
  soNumber: z.string().optional(),
}).omit({
  quantity: true,
}).extend({
  quantityOut: z.string().min(1, "Quantity out is required"),
});

export const updateProductSchema = createInsertSchema(products).omit({
  currentStock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type StockTransaction = typeof stockTransactions.$inferSelect;
export type InsertStockTransaction = z.infer<typeof insertStockTransactionSchema>;

// Extended types with relations
export type ProductWithTransactions = Product & {
  transactions: StockTransaction[];
};

export type StockTransactionWithDetails = StockTransaction & {
  product: Product;
  user: User;
};

export type UserRole = "super_admin" | "master_inventory_handler" | "stock_in_manager" | "stock_out_manager";
