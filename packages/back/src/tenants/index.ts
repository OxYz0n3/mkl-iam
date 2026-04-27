import { Elysia, t } from "elysia";

import { tCreateTenant, tGetTenantsResponse, tTenant } from "./model";
import { protectedMiddleware } from "../middleware";
import { integrations } from "./integrations";
import { TenantService } from "./service";
import { identity } from "./identity";
import { users } from "./users";


export const tenants = new Elysia({ prefix: "/tenants", tags: [ "Tenants" ] })
    .use(protectedMiddleware)
    .guard({ detail: { security: [ { bearerAuth: [] } ] }})
    .get('/', ({ user }) => TenantService.getUserTenants(user.id), {
        response: {
            200: tGetTenantsResponse
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
        .use(users)
        .use(integrations)
        .use(identity)
    );
