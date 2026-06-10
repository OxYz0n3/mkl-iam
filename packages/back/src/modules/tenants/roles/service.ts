import { DrizzleQueryError, and, eq, inArray } from "drizzle-orm";

import { HTTPError, NotFoundError, UniqueError } from "../../../lib/error";
import type { Role, RoleIntegration, UpsertRole } from "./model";
import { table } from "../../../db/schema";
import { db } from "../../../db/db";
import { integrationServices } from "../../../providers/apps/services";


type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];


export abstract class RoleService
{
    private static mapLink(link: { integrationId: string; app: string; config: unknown }): RoleIntegration
    {
        const config = (link.config ?? {}) as { projects?: string[] };

        return ({ integrationId: link.integrationId, app: link.app as 'github', config: { projects: config.projects ?? [] } });
    }

    static async getRoles(tenantId: string): Promise<Role[]>
    {
        const roles = await db.select().from(table.roles).where(eq(table.roles.tenantId, tenantId));

        if (roles.length === 0)
            return ([]);

        const links = await db
            .select({
                roleId: table.roleIntegrations.roleId,
                integrationId: table.roleIntegrations.integrationId,
                config: table.roleIntegrations.config,
                app: table.tenantIntegrations.app,
            })
            .from(table.roleIntegrations)
            .innerJoin(table.tenantIntegrations, eq(table.roleIntegrations.integrationId, table.tenantIntegrations.id))
            .where(inArray(table.roleIntegrations.roleId, roles.map((role) => role.id)));

        return (roles.map((role) => ({
            ...role,
            integrations: links
                .filter((link) => link.roleId === role.id)
                .map((link) => this.mapLink(link)),
        })));
    }

    static async getRoleById(tenantId: string, roleId: string): Promise<Role>
    {
        const [ role ] = await db.select().from(table.roles).where(and(eq(table.roles.id, roleId), eq(table.roles.tenantId, tenantId)));

        if (!role)
            throw new NotFoundError("Role not found");

        const links = await db
            .select({
                integrationId: table.roleIntegrations.integrationId,
                config: table.roleIntegrations.config,
                app: table.tenantIntegrations.app,
            })
            .from(table.roleIntegrations)
            .innerJoin(table.tenantIntegrations, eq(table.roleIntegrations.integrationId, table.tenantIntegrations.id))
            .where(eq(table.roleIntegrations.roleId, roleId));

        return ({
            ...role,
            integrations: links.map((link) => this.mapLink(link)),
        });
    }

    static async createRole(tenantId: string, body: UpsertRole): Promise<Role>
    {
        try {
            const roleId = await db.transaction(async (tx) => {
                const [ role ] = await tx.insert(table.roles).values({ tenantId, name: body.name }).returning();

                await this.setIntegrations(tx, tenantId, role.id, body.integrations);

                return (role.id);
            });

            return (await this.getRoleById(tenantId, roleId));
        } catch (error) {
            if (error instanceof DrizzleQueryError && error.cause?.message.includes("role_name_tenant_unique_idx"))
                throw new UniqueError("name");

            console.error(error);
            throw new HTTPError("Failed to create role");
        }
    }

    static async updateRole(tenantId: string, roleId: string, body: UpsertRole): Promise<Role>
    {
        const [ existing ] = await db.select().from(table.roles).where(and(eq(table.roles.id, roleId), eq(table.roles.tenantId, tenantId)));

        if (!existing)
            throw new NotFoundError("Role not found");

        try {
            await db.transaction(async (tx) => {
                await tx.update(table.roles).set({ name: body.name, updatedAt: new Date() }).where(eq(table.roles.id, roleId));

                await this.setIntegrations(tx, tenantId, roleId, body.integrations);
            });

            return (await this.getRoleById(tenantId, roleId));
        } catch (error) {
            if (error instanceof DrizzleQueryError && error.cause?.message.includes("role_name_tenant_unique_idx"))
                throw new UniqueError("name");

            console.error(error);
            throw new HTTPError("Failed to update role");
        }
    }

    static async deleteRole(tenantId: string, roleId: string): Promise<void>
    {
        const [ deleted ] = await db.delete(table.roles).where(and(eq(table.roles.id, roleId), eq(table.roles.tenantId, tenantId))).returning();

        if (!deleted)
            throw new NotFoundError("Role not found");
    }

    private static async setIntegrations(tx: DbOrTx, tenantId: string, roleId: string, integrations: UpsertRole['integrations']): Promise<void>
    {
        // Only allow linking integrations that actually belong to this tenant
        const tenantIntegrationIds = (await tx
            .select({ id: table.tenantIntegrations.id })
            .from(table.tenantIntegrations)
            .where(eq(table.tenantIntegrations.tenantId, tenantId))).map((integration) => integration.id);

        const checks = await Promise.all(integrations.map(async (integration) =>
            tenantIntegrationIds.includes(integration.integrationId)
            && await integrationServices[integration.app].isConfigValid(integration.config)));

        const valid = integrations.filter((_, index) => checks[index]);

        await tx.delete(table.roleIntegrations).where(eq(table.roleIntegrations.roleId, roleId));

        if (valid.length > 0)
            await tx.insert(table.roleIntegrations).values(valid.map((integration) => ({
                roleId,
                integrationId: integration.integrationId,
                config: integration.config ?? {},
            })));
    }
}
