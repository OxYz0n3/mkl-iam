import { Elysia, redirect, t } from 'elysia';
import jwt from '@elysiajs/jwt';

import { TenantIntegrationService } from '../../../providers/apps/base';
import { TenantService } from '../service';

import { BadRequestError, HTTPError } from '../../../lib/error';


export const integrationCallbacks = new Elysia({ prefix: '/integrations' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
    .get('/github/setup', async ({ query: { installation_id, state }, idpJwt }) => {
        console.log("Received GitHub setup callback with installation_id:", installation_id);

        const statePayload = await idpJwt.verify(state);

        console.log("Decoded state payload:", statePayload);
        if (!statePayload || !statePayload['tenantId'] || !statePayload['userId'] || !statePayload['nonce'])
            throw new HTTPError("Invalid state parameter");

        const { tenantId, redirectTo, userId, nonce } = statePayload as { tenantId: string, redirectTo?: string, userId: string, nonce: string };

        // Check that user has access to tenantId and that nonce is valid
        const tenant = await TenantService.getTenantById(userId, tenantId);

        const nonceValid = await TenantIntegrationService.verifyNonce(nonce as string);

        if (!nonceValid)
            throw new BadRequestError("Invalid nonce");

        // The shared GitHub App was installed on the org; persist the installation
        // so we can later mint installation access tokens for API calls.
        await TenantIntegrationService.createTenantIntegration({
            app: 'github',
            tenantId: tenant.id,
            metadata: { installationId: Number(installation_id) },
        });

        const url = new URL(process.env.FRONTEND_URL!);

        if (redirectTo)
            url.pathname = redirectTo;

        return (redirect(url.toString()));
    }, {
        query: t.Object({
            installation_id: t.String(),
            state: t.String(),
        })
    })
    // .get('/gitlab-cloud/callback', async ({ query: { code, state }, idpJwt }) => {
    //     const { access_token, refresh_token, expires_in } = await TenantIntegrationService.getTokensFromAuthorizationCode(code);
    //     const statePayload = await idpJwt.verify(state);

    //     if (!statePayload || !statePayload['tenantId'] || !statePayload['userId'] || !statePayload['nonce'])
    //         throw new HTTPError("Invalid state parameter");

    //     const { tenantId, redirectTo, userId, nonce } = statePayload as { tenantId: string, redirectTo?: string, userId: string, nonce: string };

    //     // Check that user has access to tenantId and that nonce is valid
    //     const tenant = await TenantService.getTenantById(userId, tenantId);
    //     const nonceValid = await TenantIntegrationService.verifyNonce(nonce as string);

    //     if (!nonceValid)
    //         throw new BadRequestError("Invalid nonce");

    //     await TenantIntegrationService.createTenantIntegration({
    //         app: 'gitlab-cloud',
    //         encryptedRefreshToken: refresh_token,
    //         tenantId: tenant.id,
    //     });

    //     const url = new URL(process.env.FRONTEND_URL!);

    //     if (redirectTo)
    //         url.pathname = redirectTo;

    //     return (redirect(url.toString()));
    // }, {
    //     query: t.Object({
    //         code: t.String(),
    //         state: t.String(),
    //     })
    // });
