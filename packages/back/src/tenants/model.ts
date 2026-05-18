import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";

import { table } from "../db/schema";


const _createTenant = createInsertSchema(table.tenants, {
    domain: t.String({ format: "hostname" }),
});
const _selectTenant = createSelectSchema(table.tenants);

const _selectUserToTenant = createSelectSchema(table.usersToTenants);

export const tCreateTenant = t.Omit(_createTenant, [ 'id', 'users', 'createdAt', 'updatedAt' ]);
export type CreateTenant   = Static<typeof tCreateTenant>;

export const tUserToTenant = _selectUserToTenant;
export type   UserToTenant = Static<typeof tUserToTenant>;

export const tTenant = t.Composite([
    _selectTenant,
    t.Object({
        isIdPSynced: t.Boolean(),
        role: tUserToTenant.properties.role,
        joinedAt: tUserToTenant.properties.joinedAt,
        userCount: t.Number(),
    }),
]);

export type Tenant = Static<typeof tTenant>;

export const tGetTenantsResponse = t.Array(tTenant);
export type GetTenantsResponse = Static<typeof tGetTenantsResponse>;
