import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { Elysia, t } from 'elysia';

import { table } from '../../db/schema';


export const tIdentityProviderKey = t.Union([ t.Literal('google'), t.Literal('azure') ]);
export type ProviderKey = typeof tIdentityProviderKey.static;

const tIdentityProviders = t.Record(tIdentityProviderKey, t.Object({
    name: t.String(),
    description: t.String(),
}));
export type IdentityProviders = typeof tIdentityProviders.static;

export const identityModels = new Elysia().model({
    IdentityProviders: tIdentityProviders,
});

const _createtenantIdP = createInsertSchema(table.tenantIdP);
const _selecttenantIdP = createSelectSchema(table.tenantIdP);

export const tCreateTenantIdP = t.Omit(_createtenantIdP, [ 'createdAt', 'updatedAt' ]);
export type  CreateTenantIdP  = typeof tCreateTenantIdP.static;

export const tTenantIdP = t.Omit(_selecttenantIdP, [ 'encryptedRefreshToken' ]);
export type  TenantIdP  = typeof tTenantIdP.static;
