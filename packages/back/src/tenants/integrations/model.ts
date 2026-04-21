import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import Elysia, { t } from "elysia";

import { table, appEnum } from "../../db/schema";


const _createIntegration = createInsertSchema(table.tenantIntegrations);
const _selectIntegration = createSelectSchema(table.tenantIntegrations);

export const tAddIntegration = t.Omit(_createIntegration, [ 'id', 'createdAt', 'updatedAt' ]);
export type AddIntegration   = typeof tAddIntegration.static;

export const tIntegration = t.Omit(_selectIntegration, [ 'encryptedAccessToken', 'encryptedRefreshToken' ]);
export type Integration   = typeof tIntegration.static;

const tIntegrationValue = t.Object({
    name: t.String(),
    description: t.String(),
    type: t.Union([ t.Literal('oauth'), t.Literal('accessToken') ]),
});
export const tAvailableIntegrations = t.Record(t.String(), tIntegrationValue);
export type AvailableIntegrations = typeof tAvailableIntegrations.static;

export const integrationModels = new Elysia().model({
    Integration: tIntegration,
});
