import { Elysia, t } from "elysia";

import { protectedMiddleware } from "../middleware";
import { TenantService } from "./service";
import { tCreateTenant, tGetTenantsResponse, tTenant, tUserToTenant } from "./model";


export const tenants = new Elysia({ prefix: "/tenants", tags: [ "Tenants" ] })
    .use(protectedMiddleware)
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
    });
