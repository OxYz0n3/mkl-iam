import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

import { table } from "../../db/schema";


const _createTenantIdP = createInsertSchema(table.tenantIdp);
const _selectTenantIdP = createSelectSchema(table.tenantIdp);

export const tCreateTenantIdP = t.Omit(_createTenantIdP, [ 'createdAt', 'updatedAt' ]);
export type  CreateTenantIdP  = typeof tCreateTenantIdP.static;

export const tTenantIdP = t.Omit(_selectTenantIdP, [ 'encryptedRefreshToken' ]);
export type  TenantIdP  = typeof tTenantIdP.static;
