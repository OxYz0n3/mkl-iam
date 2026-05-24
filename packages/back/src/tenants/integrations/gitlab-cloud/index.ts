import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';

import { protectedMiddleware } from '../../../middleware';
import { TenantService } from '../../service';
import { GitlabCloudService } from './service';


export const gitlabCloud = new Elysia({ prefix: '/gitlab-cloud' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
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
