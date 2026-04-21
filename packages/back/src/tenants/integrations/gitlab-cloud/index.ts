import { Elysia, redirect, t } from 'elysia';
import jwt from '@elysiajs/jwt';

import { BadRequestError, HTTPError } from '../../../utils/error';
import { protectedMiddleware } from '../../../middleware';
import { TenantService } from '../../service';
import { GitlabCloudService } from './service';


export const gitlabCloud = new Elysia({ prefix: '/gitlab-cloud' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
    .get('/callback', async ({ query: { code, state }, idpJwt }) => {
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
            nonce: await GitlabCloudService.createNonce(),
            tenantId: tenantId,
            userId: user.id,
            redirectTo,
        });

        return (GitlabCloudService.getAuthUrl(state));
    }, {
        beforeHandle: TenantService.tenantBelongsToUser,
        query: t.Object({
            redirectTo: t.Optional(t.String()),
            tenantId: t.String(),
        }),
        response: {
            200: t.String({
                description: "The URL to redirect the user to for GitLab authentication",
            }),
        }
    });
