import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import Elysia, { t } from "elysia";

import { table } from "../../db/schema";


const _createTenantUser = createInsertSchema(table.tenantUsers, {
    primaryEmail: t.String({ format: "email" }),
    secondaryEmail: t.Optional(t.String({ format: "email" })),
});
const _selectTenantUser = createSelectSchema(table.tenantUsers);

export const TAddUser = t.Omit(_createTenantUser, [ 'id', 'createdAt', 'updatedAt', 'tenantId' ]);
export type AddUser   = typeof TAddUser.static;

export const TUser = t.Object(_selectTenantUser.properties, { $id: 'TenantUser' });
export type TenantUser   = typeof TUser.static;

export const userModels = new Elysia().model({
    TenantUser: TUser,
});
