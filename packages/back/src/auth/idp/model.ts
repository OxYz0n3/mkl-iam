import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

import { table } from "../../db/schema";


const _createtenantIdP = createInsertSchema(table.tenantIdP);
const _selecttenantIdP = createSelectSchema(table.tenantIdP);

export const tCreateTenantIdP = t.Omit(_createtenantIdP, [ 'createdAt', 'updatedAt' ]);
export type  CreateTenantIdP  = typeof tCreateTenantIdP.static;

export const tTenantIdP = t.Omit(_selecttenantIdP, [ 'encryptedRefreshToken' ]);
export type  TenantIdP  = typeof tTenantIdP.static;
