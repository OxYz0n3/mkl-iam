import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"


export const tenants   = pgTable("tenants", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    users: integer().references(() => users.id).array().notNull(),
});

export const users     = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar().notNull(),
    lastName: varchar().notNull(),
    email: varchar().notNull().unique(),
    password: varchar().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const employees = pgTable("employees", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: varchar().notNull(),
    lastName: varchar().notNull(),
    email: varchar().notNull().unique(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    role: varchar(),
});

export const table = {
    tenants,
    users,
    employees,
};
