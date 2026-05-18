import { Elysia, t } from "elysia";

import { protectedMiddleware } from "../middleware";
import { tCreateTenant, tTenant } from "./model";
import { integrations } from "./integrations";
import { TenantService } from "./service";
import { identity } from "./identity";
import { users } from "./users";


export const tenants = new Elysia({ prefix: "/tenants", tags: [ "Tenants" ] })
    .use(protectedMiddleware)
    .guard({ detail: { security: [ { bearerAuth: [] } ] }})
    .get('/', ({ user }) => TenantService.getUserTenants(user.id), {
        response: {
            200: t.Array(tTenant)
        }
    })
    .post('/', ({ user, body }) => TenantService.addTenant(user.id, body), {
        body: tCreateTenant,
        response: {
            200: tTenant
        }
    })
    .group('/:tenantId', {
        beforeHandle: TenantService.tenantBelongsToUser,
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
    }, (app) => app
        .delete('/', async ({ params: { tenantId }, status }) => {
            await TenantService.deleteTenant(tenantId);

            return (status(204, undefined));
        }, {
            beforeHandle: TenantService.tenantOwnedByUser,
            response: {
                204: t.Void()
            }
        })
        .use(users)
        .use(integrations)
        .use(identity)
    );
