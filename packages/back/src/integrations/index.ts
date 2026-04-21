import { Elysia, t } from 'elysia';

import { integrationModels, tAvailableIntegrations } from './model';
import { protectedMiddleware } from '../middleware';
import { TenantService } from '../tenants/service';
import { IntegrationService } from './service';
import { gitlabCloud } from './gitlab-cloud';


export const integrations = new Elysia({ prefix: '/integrations', tags: [ 'Integrations' ] })
    .use(gitlabCloud)
    .use(protectedMiddleware)
    .use(integrationModels)
    .get('/', ({ query: { tenantId } }) => IntegrationService.getIntegrations(tenantId), {
        beforeHandle: TenantService.tenantBelongsToUser,
        query: t.Object({
            tenantId: t.String(),
        }),
        response: {
            200: t.Object({
                addedIntegrations: t.Array(t.Ref('Integration')),
                availableIntegrations: tAvailableIntegrations
            }),
        }
    })
    .delete('/:integrationId', ({ query: { tenantId }, params: { integrationId } }) => IntegrationService.deleteIntegration(tenantId, integrationId), {
        beforeHandle: TenantService.tenantBelongsToUser,
        params: t.Object({
            integrationId: t.String(),
        }),
        query: t.Object({
            tenantId: t.String(),
        }),
        response: {
            204: t.Void(),
        }
    });
