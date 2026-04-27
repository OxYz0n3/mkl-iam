import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { Elysia, t } from 'elysia';

import { table } from '../../db/schema';


const _createtenantIdP = createInsertSchema(table.tenantIdP);
const _selecttenantIdP = createSelectSchema(table.tenantIdP);

export const tCreateTenantIdP = t.Omit(_createtenantIdP, [ 'createdAt', 'updatedAt' ]);
export type  CreateTenantIdP  = typeof tCreateTenantIdP.static;

export const tTenantIdPWithToken = _selecttenantIdP;
export type TenantIdPWithToken = typeof tTenantIdPWithToken.static;

export const tTenantIdP = t.Omit(tTenantIdPWithToken, [ 'encryptedRefreshToken' ], { $id: 'TenantIdP' });
export type  TenantIdP  = typeof tTenantIdP.static;

export const tIdentityProviderKey = t.Union([ t.Literal('google'), t.Literal('microsoft') ]);
export type ProviderKey = typeof tIdentityProviderKey.static;

const tIdentityProviders = t.Record(tIdentityProviderKey, t.Object({
    name: t.String(),
    description: t.String(),
}));
export type IdentityProviders = typeof tIdentityProviders.static;

export const identityModels = new Elysia().model({
    IdentityProviders: tIdentityProviders,
    TenantIdP: tTenantIdP,
});
