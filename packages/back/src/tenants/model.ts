import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";

import { table } from "../db/schema";


const _createTenant = createInsertSchema(table.tenants);
const _selectTenant = createSelectSchema(table.tenants);

const _selectUserToTenant = createSelectSchema(table.usersToTenants);

export const tCreateTenant = t.Omit(_createTenant, [ 'id', 'users', 'createdAt', 'updatedAt' ]);
export type CreateTenant   = Static<typeof tCreateTenant>;

export const tTenant = _selectTenant;
export type   Tenant = Static<typeof tTenant>;

export const tUserToTenant = _selectUserToTenant;
export type   UserToTenant = Static<typeof tUserToTenant>;

export const tGetTenantsResponse = t.Array(t.Object({
    tenant: tTenant,
    role: tUserToTenant.properties.role,
    joinedAt: tUserToTenant.properties.joinedAt,
    employeeCount: t.Number()
}));
export type GetTenantsResponse = Static<typeof tGetTenantsResponse>;
