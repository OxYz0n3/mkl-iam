import { Elysia, t } from "elysia";

import { roleModels, tUpsertRole } from "./model";
import { RoleService } from "./service";


export const roles = new Elysia({ prefix: "/roles", tags: [ "Tenants / Roles" ] })
    .use(roleModels)
    .get("/", ({ params: { tenantId } }) => RoleService.getRoles(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.Array(t.Ref('Role')),
        },
    })
    .post("/", ({ params: { tenantId }, body }) => RoleService.createRole(tenantId, body), {
        body: tUpsertRole,
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'Role',
        },
    })
    .put("/:roleId", ({ params: { tenantId, roleId }, body }) => RoleService.updateRole(tenantId, roleId, body), {
        body: tUpsertRole,
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            roleId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'Role',
        },
    })
    .delete("/:roleId", async ({ params: { tenantId, roleId }, status }) => {
        await RoleService.deleteRole(tenantId, roleId);

        return (status(204, undefined));
    }, {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            roleId: t.String({ format: 'uuid' }),
        }),
        response: {
            204: t.Void(),
        },
    });
