import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';

import { integrationModels, tAvailableIntegrations } from './model';
import { integrationServices } from '../../../providers/apps/services';
import { protectedMiddleware } from '../../../middleware';
import { IntegrationService } from './service';
import { TenantService } from '../service';


export const integrations = new Elysia({ prefix: '/integrations', tags: [ 'Tenants / Integrations' ] })
    .use(protectedMiddleware)
    .use(integrationModels)
    .use(jwt({
        name: 'integrationJwt',
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
    .get('/login-url/:integrationKey', async ({ query: { redirectTo }, params: { tenantId, integrationKey }, user, integrationJwt }) => {
        const state = await integrationJwt.sign({
            nonce: await integrationServices[integrationKey].createNonce(),
            tenantId: tenantId,
            userId: user.id,
            redirectTo,
        });

        return (integrationServices[integrationKey].getAuthUrl(state));
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
        beforeHandle: TenantService.tenantBelongsToUser,
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            integrationId: t.String(),
        }),
        response: {
            204: t.Void(),
        }
    })
    .get('/:integrationId/resources', async ({ params: { tenantId, integrationId } }) => {
        const integration = await IntegrationService.getIntegrationById(tenantId, integrationId);
        const service     = integrationServices[integration.app];

        return ({ resources: await service.getResources(integration.metadata) });
    }, {
        beforeHandle: TenantService.tenantBelongsToUser,
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            integrationId: t.String(),
        }),
        response: {
            200: t.Object({
                resources: t.Array(t.Object({ id: t.String(), name: t.String() })),
            }),
        }
    });
