import { jsonb, pgEnum, pgTable, primaryKey, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { integrations } from "../providers/apps/registry";
import { identityProviders } from "../providers/identity/registry";


export const idpEnum = pgEnum('idp_provider', Object.keys(identityProviders) as [ keyof typeof identityProviders ]);
export const appEnum = pgEnum('app_provider', Object.keys(integrations) as [ keyof typeof integrations ]);
export const tenantRoleEnum = pgEnum('tenant_role', [ 'owner', 'admin', 'member']);

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
    domain: varchar('domain', { length: 255 }).notNull().unique(),
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

export const roles = pgTable("roles", {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    unique('role_name_tenant_unique_idx').on(table.tenantId, table.name)
]);

export const usersToTenants = pgTable('users_to_tenants', {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    role: tenantRoleEnum('role').notNull(),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => [
    primaryKey({ columns: [ table.userId, table.tenantId ] })
]);

export const tenantUsers = pgTable("tenant_users", {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    primaryEmail: varchar('primary_email', { length: 255 }).notNull(),
    secondaryEmail: varchar('secondary_email', { length: 255 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
}, (table) => [
    unique().on(table.primaryEmail, table.tenantId)
]);

export const tenantIdP = pgTable("tenant_idp", {
    tenantId: uuid('tenant_id').primaryKey().references(() => tenants.id, { onDelete: 'cascade' }),
    provider: idpEnum('provider').notNull(),
    encryptedRefreshToken: text('encrypted_refresh_token').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tenantIntegrations = pgTable("tenant_integrations", {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    app: appEnum('app').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    unique('tenant_app_unique_idx').on(table.tenantId, table.app)
]);

export const roleIntegrations = pgTable("role_integrations", {
    id: uuid('id').primaryKey().defaultRandom(),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    integrationId: uuid('integration_id').notNull().references(() => tenantIntegrations.id, { onDelete: 'cascade' }),
    config: jsonb('config').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
    unique('role_integration_unique_idx').on(table.roleId, table.integrationId)
]);


export const table = {
    sessions,
    tenants,
    users,
    tenantUsers,
    usersToTenants,
    tenantIdP,
    tenantIntegrations,
    roles,
    roleIntegrations,
};
