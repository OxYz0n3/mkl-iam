import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import Elysia, { t } from "elysia";

import { table } from "../../../db/schema";

export const tIntegrationKey = t.Union([ t.Literal('github') ], { $id: 'IntegrationKey' });
export type IntegrationKey   = typeof tIntegrationKey.static;

const _createIntegration = createInsertSchema(table.tenantIntegrations, {
    app: tIntegrationKey,
});
const _selectIntegration = createSelectSchema(table.tenantIntegrations, {
    app: tIntegrationKey,
});

export const tAddIntegration = t.Omit(_createIntegration, [ 'id', 'createdAt', 'updatedAt' ]);
export type AddIntegration   = typeof tAddIntegration.static;

export const tIntegration = _selectIntegration;
export type Integration   = typeof tIntegration.static;

const tIntegrationValue = t.Object({
    name: t.String(),
    description: t.String(),
    type: t.Union([ t.Literal('oauth'), t.Literal('accessToken'), t.Literal('custom') ]),
});
export const tAvailableIntegrations = t.Record(t.String(), tIntegrationValue);
export type AvailableIntegrations = typeof tAvailableIntegrations.static;

export const integrationModels = new Elysia().model({
    Integration: tIntegration,
    IntegrationKey: tIntegrationKey
});
