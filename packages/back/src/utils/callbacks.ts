import { Elysia, redirect, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import { GitHubService } from '../tenants/integrations/github/service';
import { GitlabCloudService } from '../tenants/integrations/gitlab-cloud/service';
import { TenantService } from '../tenants/service';
import { BadRequestError, HTTPError } from './error';


export const integrationCallbacks = new Elysia({ prefix: '/integrations' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
    .get('/github/callback', async ({ query: { code, state }, idpJwt }) => {
        const statePayload = await idpJwt.verify(state);

        if (!statePayload || !statePayload['tenantId'] || !statePayload['userId'] || !statePayload['nonce'])
            throw new HTTPError("Invalid state parameter");

        const { tenantId, redirectTo, userId, nonce } = statePayload as { tenantId: string, redirectTo?: string, userId: string, nonce: string };

        // Check that user has access to tenantId and that nonce is valid
        const tenant = await TenantService.getTenantById(userId, tenantId);
        const nonceValid = await GitHubService.verifyNonce(nonce as string);

        if (!nonceValid)
            throw new BadRequestError("Invalid nonce");

        const { access_token, refresh_token } = await GitHubService.getTokensFromAuthorizationCode(tenant.id, code);

        await GitHubService.createTenantIntegration({
            app: 'github',
            encryptedRefreshToken: refresh_token,  // TODO: Encrypt this token before storing
            tenantId: tenant.id,
        });

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
    .get('/gitlab-cloud/callback', async ({ query: { code, state }, idpJwt }) => {
        const { access_token, refresh_token, expires_in } = await GitlabCloudService.getTokensFromAuthorizationCode(code);
        const statePayload = await idpJwt.verify(state);

        if (!statePayload || !statePayload['tenantId'] || !statePayload['userId'] || !statePayload['nonce'])
            throw new HTTPError("Invalid state parameter");

        const { tenantId, redirectTo, userId, nonce } = statePayload as { tenantId: string, redirectTo?: string, userId: string, nonce: string };

        // Check that user has access to tenantId and that nonce is valid
        const tenant = await TenantService.getTenantById(userId, tenantId);
        const nonceValid = await GitlabCloudService.verifyNonce(nonce as string);

        if (!nonceValid)
            throw new BadRequestError("Invalid nonce");

        await GitlabCloudService.createTenantIntegration({
            app: 'gitlab-cloud',
            encryptedRefreshToken: refresh_token,  // TODO: Encrypt this token before storing
            tenantId: tenant.id,
        });

        const url = new URL(process.env.FRONTEND_URL!);

        if (redirectTo)
            url.pathname = redirectTo;

        return (redirect(url.toString()));
    }, {
        query: t.Object({
            code: t.String(),
            state: t.String(),
        })
    });