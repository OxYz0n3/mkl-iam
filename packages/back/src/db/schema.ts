import { pgTable, primaryKey, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const sessions  = pgTable("sessions", {
    id: uuid('id').primaryKey().defaultRandom(),
    expiresAt: timestamp('expires_at').notNull().default(sql`now() + interval '7 days'`), // Default to 7 days from now
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    userAgent: varchar('user_agent', { length: 255 }),
});

export const tenants   = pgTable("tenants", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users     = pgTable("users", {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersToTenants = pgTable('users_to_tenants', {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull().default('member'),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => [
    primaryKey({ columns: [ table.userId, table.tenantId ] })
]);

export const employees = pgTable("employees", {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    role: varchar('role', { length: 100 }),
}, (table) => [
    unique().on(table.email, table.tenantId)
]);

export const table = {
    sessions,
    tenants,
    users,
    employees,
    usersToTenants
};
