import { Elysia, t } from 'elysia';


const tIdentityProviderKey = t.Union([ t.Literal('google'), t.Literal('azure') ]);
export type ProviderKey = typeof tIdentityProviderKey.static;

const tIdentityProviders = t.Record(tIdentityProviderKey, t.Object({
    name: t.String(),
    description: t.String(),
}));
export type IdentityProviders = typeof tIdentityProviders.static;

export const identityModels = new Elysia().model({
    IdentityProviders: tIdentityProviders,
});
