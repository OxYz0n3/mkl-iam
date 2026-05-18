import { count, eq, and, sql, getTableColumns } from "drizzle-orm";

import { CreateTenant, GetTenantsResponse, Tenant } from "./model";
import { table } from "../db/schema";
import { db } from "../db/db";
import { NotFoundError } from "elysia";


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

    static async getUserTenants(userId: string): Promise<GetTenantsResponse>
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

    static async addTenant(userId: string, tenant: CreateTenant): Promise<void>
    {
        const [ newTenant ] = await db.insert(table.tenants).values(tenant).returning();

        await db.insert(table.usersToTenants).values({ userId, tenantId: newTenant.id, role: 'owner' });
    }

    static async tenantBelongsToUser({ params: { tenantId }, user }: { params: { tenantId: string }, user?: { id: string } }): Promise<void>
    {
        if (!user)
            throw new NotFoundError('Tenant not found or access denied');

        const tenants = await TenantService.getUserTenants(user.id);
        const tenant = tenants.find((t) => t.id === tenantId);

        if (!tenant)
            throw new NotFoundError('Tenant not found or access denied');
    }
}
