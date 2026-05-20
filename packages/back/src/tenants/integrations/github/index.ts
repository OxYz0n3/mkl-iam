import { Elysia, redirect, t } from 'elysia';
import jwt from '@elysiajs/jwt';

import { BadRequestError, HTTPError } from '../../../utils/error';
import { protectedMiddleware } from '../../../middleware';
import { TenantService } from '../../service';
import { GitHubService } from './service';


export const github = new Elysia({ prefix: '/github' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
    .get('/callback', async ({ query: { code, state }, idpJwt }) => {
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
    .get('/login-url', async ({ query: { redirectTo }, params: { tenantId }, user, idpJwt }) => {
        const state = await idpJwt.sign({
            nonce: await GitHubService.createNonce(),
            tenantId: tenantId,
            userId: user.id,
            redirectTo,
        });

        return (GitHubService.getAuthUrl(state));
    }, {
        beforeHandle: TenantService.tenantBelongsToUser,
        params: t.Object({
            tenantId: t.String(),
        }),
        query: t.Object({
            redirectTo: t.Optional(t.String()),
        }),
        response: {
            200: t.String({
                description: "The URL to redirect the user to for GitHub authentication",
            }),
        }
    });
