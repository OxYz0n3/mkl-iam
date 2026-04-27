import { Elysia, t } from "elysia";

import { userModels, TAddUser } from "./model";
import { TenantUserService } from "./service";


export const users = new Elysia({ prefix: "/users", tags: [ "Tenants / Users" ] })
    .use(userModels)
    .get("/:userId", ({ params: { userId } }) => TenantUserService.getUserById(userId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            userId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'TenantUser',
        },
    })
    .get("/", ({ params: { tenantId } }) => TenantUserService.getUsers(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.Array(t.Ref('TenantUser')),
        },
    })
    .post("/", ({ body, params: { tenantId } }) => TenantUserService.addUser(tenantId, body), {
        body: TAddUser,
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            201: 'TenantUser',
        },
    })
    .delete("/:userId", ({ params: { tenantId, userId } }) => TenantUserService.deleteUser(tenantId, userId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            userId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'TenantUser'
        },
    })
    .post('/sync', async ({ params: { tenantId } }) => TenantUserService.syncUsers(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.Array(t.Ref('TenantUser'), {
                description: "The array of added users, if any. Note that this endpoint is idempotent and will not return users that were previously added in past syncs"
            })
        },
    });
