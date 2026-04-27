import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";

import { identityModels, tIdentityProviderKey, tTenantIdP } from "./model";
import { BadRequestError, HTTPError } from "../../utils/error";
import { protectedMiddleware } from "../../middleware";
import { providersServiceMap } from "./providers";
import { IdentityService } from "./service";
import { TenantService } from "../service";


if (!process.env.IDP_JWT_SECRET)
    throw new Error("IDP_JWT_SECRET must be set in environment variables");
if (!process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL must be set in environment variables");


const idpJWTSetup = jwt({
    name: 'idpJWT',
    secret: process.env.IDP_JWT_SECRET!,
    exp: '15m',
});


export const identityCallbacks = new Elysia({ prefix: "/identity", tags: [ "Identity Callbacks" ] })
    .use(idpJWTSetup)
    .get('/:provider/callback', async ({ redirect, params: { provider }, query: { code, state }, idpJWT }) => {
        const statePayload = await idpJWT.verify(state);

        if (!statePayload || !statePayload['tenantId'] || !statePayload['userId'] || !statePayload['nonce'])
            throw new HTTPError("Invalid state parameter");

        const { tenantId, redirectTo, userId, nonce } = statePayload as { tenantId: string, redirectTo?: string, userId: string, nonce: string };

        // Check that user has access to tenantId and that nonce is valid
        const nonceValid = await providersServiceMap[provider].verifyNonce(nonce as string);

        if (!nonceValid)
            throw new BadRequestError("Invalid nonce");

        await TenantService.tenantBelongsToUser({ params: { tenantId }, user: { id: userId } });

        const { access_token, refresh_token } = await providersServiceMap[provider].getTokensFromAuthorizationCode(tenantId, code);

        await IdentityService.createTenantIdP({
            provider,
            encryptedRefreshToken: refresh_token,  // TODO: Encrypt this token before storing
            tenantId: tenantId,
        });

        const url = new URL(process.env.FRONTEND_URL!);

        if (redirectTo)
            url.pathname = redirectTo;

        // const users = await providersServiceMap[provider].getUsers(tenantId, access_token);

        return (redirect(url.toString()));
    }, {
        params: t.Object({
            provider: tIdentityProviderKey,
        }),
        query: t.Object({
            code: t.String(),
            state: t.String(),
        })
    });

export const identity = new Elysia({ prefix: "/identity", tags: [ "Tenants / Identity" ] })
    .use(protectedMiddleware)
    .use(identityModels)
    .get('/', ({ params: { tenantId } }) => IdentityService.getTenantIdP(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.Nullable(tTenantIdP, { description: "Returns the tenant's identity provider configuration if it exists, otherwise null" }),
        }
    })
    .delete('/', async ({ params: { tenantId } }) => IdentityService.deleteTenantIdP(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            204: t.Void(),
        }
    })
    .get("/providers", ({ params: { tenantId } }) => IdentityService.getProviders(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'IdentityProviders',
        }
    })
    .use(idpJWTSetup)
    .get('/:provider/login-url', async ({ params: { provider }, query: { redirectTo, tenantId }, user, idpJWT }) => {
        const state = await idpJWT.sign({
            nonce: await providersServiceMap[provider].createNonce(),
            tenantId: tenantId,
            userId: user.id,
            redirectTo,
        });

        return (providersServiceMap[provider].getAuthUrl(state));
    }, {
        params: t.Object({
            provider: tIdentityProviderKey,
        }),
        query: t.Object({
            redirectTo: t.Optional(t.String()),
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.String({
                description: "The URL to redirect the user to the specified identity provider authentication",
            }),
        }
    });
