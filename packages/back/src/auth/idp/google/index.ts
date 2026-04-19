import { Elysia, t } from "elysia";
import { jwt} from "@elysiajs/jwt";

import { BadRequestError, HTTPError } from "../../../utils/error";
import { protectedMiddleware } from "../../../middleware";
import { TenantService } from "../../../tenants/service";
import { GoogleService } from "./service";


if (!process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL environment variable is not set");

if (!process.env.IDP_JWT_SECRET)
    throw new Error("IDP_JWT_SECRET environment variable is not set");


export const google = new Elysia({ prefix: '/google' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
    .get('/callback', async ({ redirect, query: { code, state }, idpJwt }) => {
        const { access_token, refresh_token, expires_in } = await GoogleService.getTokensFromAuthorizationCode(code);
        const statePayload = await idpJwt.verify(state);

        if (!statePayload || !statePayload['tenantId'] || !statePayload['userId'] || !statePayload['nonce'])
            throw new HTTPError("Invalid state parameter");

        const { tenantId, redirectTo, userId, nonce } = statePayload as { tenantId: string, redirectTo?: string, userId: string, nonce: string };

        // Check that user has access to tenantId and that nonce is valid
        const tenant = await TenantService.getTenantById(userId, tenantId);
        const nonceValid = await GoogleService.verifyNonce(nonce as string);

        if (!nonceValid)
            throw new BadRequestError("Invalid nonce");

        await GoogleService.createTenantIdP({
            provider: 'google',
            encryptedRefreshToken: refresh_token,  // TODO: Encrypt this token before storing
            tenantId: tenant.id,
        })

        const url = new URL(process.env.FRONTEND_URL!);

        if (redirectTo)
            url.pathname = redirectTo;

        return (redirect(url.toString()));
    }, {
        query: t.Object({
            code: t.String(),
            state: t.String(),
        })
    })
    .use(protectedMiddleware)
    .get('/login-url', async ({ query: { redirectTo, tenantId }, user, idpJwt }) => {
        const state = await idpJwt.sign({
            nonce: await GoogleService.createNonce(),
            tenantId: tenantId,
            userId: user.id,
            redirectTo,
        });

        return (GoogleService.getAuthUrl(state));
    }, {
        beforeHandle: TenantService.tenantBelongsToUser,
        query: t.Object({
            redirectTo: t.Optional(t.String()),
            tenantId: t.String(),
        }),
        response: {
            200: t.String({
                description: "The URL to redirect the user to for Google authentication",
            }),
        }
    });
