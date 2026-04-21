import { Elysia, t } from 'elysia';

import { integrationModels, tAvailableIntegrations } from './model';
import { IntegrationService } from './service';
import { gitlabCloud } from './gitlab-cloud';


export const integrations = new Elysia({ prefix: '/integrations', tags: [ 'Tenants / Integrations' ] })
    .use(gitlabCloud)
    .use(integrationModels)
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
    .delete('/:integrationId', ({ params: { tenantId, integrationId } }) => IntegrationService.deleteIntegration(tenantId, integrationId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            integrationId: t.String(),
        }),
        response: {
            204: t.Void(),
        }
    });
