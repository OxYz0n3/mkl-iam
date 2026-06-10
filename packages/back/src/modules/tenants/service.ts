import { count, eq, and, sql, getTableColumns, DrizzleQueryError } from "drizzle-orm";

import { CreateTenant, Tenant } from "./model";
import { table } from "../../db/schema";
import { db } from "../../db/db";
import { NotFoundError } from "elysia";
import { ForbiddenError, HTTPError, UniqueError } from "../../lib/error";


export class TenantService
{
    static async getTenantById(userId: string, tenantId: string): Promise<Tenant>
    {
        const tenants = await this.getUserTenants(userId);
        const tenant = tenants.find((t) => t.id === tenantId);

        if (!tenant)
            throw new NotFoundError('Tenant not found or access denied');

        return (tenant);
    }

    static async getUserTenants(userId: string): Promise<Tenant[]>
    {
        const tenants = await db.
            select({
                ...getTableColumns(table.tenants),
                isIdPSynced: sql<boolean>`EXISTS (SELECT 1 FROM ${table.tenantIdP} WHERE ${table.tenantIdP.tenantId} = ${table.tenants.id})`,
                role: table.usersToTenants.role,
                joinedAt: table.usersToTenants.joinedAt,
                userCount: count(table.tenantUsers.id),
            })
            .from(table.usersToTenants)
            .innerJoin(table.tenants, eq(table.usersToTenants.tenantId, table.tenants.id))
            .leftJoin(table.tenantUsers, eq(table.tenantUsers.tenantId, table.tenants.id))
            .where(eq(table.usersToTenants.userId, userId))
            .groupBy(
                table.tenants.id,
                table.usersToTenants.role,
                table.usersToTenants.joinedAt
            )
            .orderBy(table.tenants.name);

        return (tenants);
    }

    static async addTenant(userId: string, tenant: CreateTenant): Promise<Tenant>
    {
        try {
            const { newTenant, newTenantUser } = await db.transaction(async (tx) => {
                const [ newTenant ] = await tx.insert(table.tenants).values(tenant).returning();

                const [ newTenantUser ] = await tx.insert(table.usersToTenants).values({ userId, tenantId: newTenant.id, role: 'owner' }).returning();

                return ({ newTenant, newTenantUser });
            });

            return ({
                ...newTenant,
                isIdPSynced: false,
                role: newTenantUser.role,
                joinedAt: newTenantUser.joinedAt,
                userCount: 0,
            });
        } catch (error) {
            if (error instanceof DrizzleQueryError && error.cause?.message.includes("tenants_domain_unique"))
                throw new UniqueError("tenant");

            console.error(error);
            throw new HTTPError("Failed to create tenant");
        }
    }

    static async deleteTenant(tenantId: string): Promise<void>
    {
        const [ deletedTenant ] = await db.delete(table.tenants).where(eq(table.tenants.id, tenantId)).returning();

        if (!deletedTenant)
            throw new NotFoundError('Tenant not found');
    }

    /** Lightweight membership lookup — returns the user's role in the tenant, or null. */
    static async getUserTenantRole(userId: string, tenantId: string): Promise<'owner' | 'admin' | 'member' | null>
    {
        const [ membership ] = await db
            .select({ role: table.usersToTenants.role })
            .from(table.usersToTenants)
            .where(and(eq(table.usersToTenants.userId, userId), eq(table.usersToTenants.tenantId, tenantId)));

        return (membership?.role ?? null);
    }

    static async tenantBelongsToUser({ params: { tenantId }, user }: { params: { tenantId: string }, user?: { id: string } }): Promise<void>
    {
        if (!user || !(await TenantService.getUserTenantRole(user.id, tenantId)))
            throw new NotFoundError('Tenant not found or access denied');
    }

    static async tenantOwnedByUser({ params: { tenantId }, user }: { params: { tenantId: string }, user?: { id: string } }): Promise<void>
    {
        if (!user)
            throw new NotFoundError('Tenant not found or access denied');

        const role = await TenantService.getUserTenantRole(user.id, tenantId);

        if (!role)
            throw new NotFoundError('Tenant not found or access denied');

        if (role != 'owner')
            throw new ForbiddenError('You are not the owner of this tenant')
    }
}
