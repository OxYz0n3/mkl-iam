import { createSelectSchema } from "drizzle-typebox";
import Elysia, { t } from "elysia";

import { table } from "../../../db/schema";


const _selectRole = createSelectSchema(table.roles);

/**
 * Per-integration role configuration, discriminated by `app`.
 * When wiring up a new integration, add its variant here and a matching
 * config form in the frontend registry (components/role-config).
 */
const tGithubRoleIntegration = t.Object({
    integrationId: t.String({ format: 'uuid' }),
    app: t.Literal('github'),
    config: t.Any(),
});

export const tRoleIntegration = t.Union([
    tGithubRoleIntegration,
]);
export type RoleIntegration = typeof tRoleIntegration.static;

export const tRole = t.Object({
    ..._selectRole.properties,
    integrations: t.Array(tRoleIntegration),
}, { $id: 'Role' });
export type Role = typeof tRole.static;

export const tUpsertRole = t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
    integrations: t.Array(tRoleIntegration),
});
export type UpsertRole = typeof tUpsertRole.static;

export const roleModels = new Elysia().model({
    Role: tRole,
});
