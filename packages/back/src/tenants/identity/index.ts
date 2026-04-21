import { Elysia, t } from "elysia";
import { IdentityService } from "./service";
import { identityModels } from "./model";

export const identity = new Elysia({ prefix: "/identity", tags: [ "Tenants / Identity" ] })
    .use(identityModels)
    .get("/providers", ({ params: { tenantId } }) => IdentityService.getProviders(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'IdentityProviders',
        }
    });
