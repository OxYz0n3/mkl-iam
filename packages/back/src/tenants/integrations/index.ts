import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';

import { integrationModels, tAvailableIntegrations, tIntegrationKey, IntegrationKey } from './model';
import { protectedMiddleware } from '../../middleware';
import { IntegrationService } from './service';
import { OAuthService } from '../../utils/oauth_service';
import { GitHubService } from './github/service';
import { TenantService } from '../service';

const services: Record<IntegrationKey, typeof OAuthService> = {
    'github': GitHubService
};

export const integrations = new Elysia({ prefix: '/integrations', tags: [ 'Tenants / Integrations' ] })
    .use(protectedMiddleware)
    .use(integrationModels)
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.IDP_JWT_SECRET!,
        exp: '15m',
    }))
    .get('/', ({ params: { tenantId } }) => IntegrationService.getIntegrations(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.Object({
                addedIntegrations: t.Array(t.Ref('Integration')),
                availableIntegrations: tAvailableIntegrations
            }),
        }
    })
    .get('/:integrationKey/login-url', async ({ query: { redirectTo }, params: { tenantId, integrationKey }, user, idpJwt }) => {
        const state = await idpJwt.sign({
            nonce: await services[integrationKey].createNonce(),
            tenantId: tenantId,
            userId: user.id,
            redirectTo,
        });

        return (services[integrationKey].getAuthUrl(state));
    }, {
        beforeHandle: TenantService.tenantBelongsToUser,
        params: t.Object({
            tenantId: t.String(),
            integrationKey: t.Ref('IntegrationKey'),
        }),
        query: t.Object({
            redirectTo: t.Optional(t.String()),
        }),
        response: {
            200: t.String({
                description: "The URL to redirect the user after the OAuth flow is complete",
            }),
        }
    })
    .delete('/:integrationId', ({ params: { tenantId, integrationId } }) => IntegrationService.deleteIntegration(tenantId, integrationId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            integrationId: t.String(),
        }),
        response: {
            204: t.Void(),
        }
    });
