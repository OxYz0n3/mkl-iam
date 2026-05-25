import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';

import { protectedMiddleware } from '../../../middleware';
import { TenantService } from '../../service';
import { GitHubService } from './service';


export const github = new Elysia({ prefix: '/github' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
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
    })
    .get('/organizations/:org/members', async ({ params: { tenantId, org } }) =>
    {
        return (GitHubService.getOrganizationMembers(tenantId, org));
    }, {
        beforeHandle: TenantService.tenantBelongsToUser,
        params: t.Object({
            tenantId: t.String(),
            org: t.String({ description: "GitHub organization name" }),
        }),
        response: {
            200: t.Array(t.Object({
                name: t.String({ description: "User's display name or login" }),
                email: t.Union([ t.String(), t.Null() ], { description: "User's public email (may be null)" }),
                status: t.String({ description: "Membership status: active or pending" }),
            }), { description: "List of organization members" }),
        },
    });
