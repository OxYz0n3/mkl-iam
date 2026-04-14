import { count, eq } from "drizzle-orm";

import { CreateTenant, GetTenantsResponse, Tenant } from "./model";
import { table } from "../db/schema";
import { db } from "../db/db";


export class TenantService
{
    static async getUserTenants(userId: string): Promise<GetTenantsResponse>
    {
        const tenants = await db.
            select({
                tenant: table.tenants,
                role: table.usersToTenants.role,
                joinedAt: table.usersToTenants.joinedAt,
                employeeCount: count(table.employees.id),
            })
            .from(table.usersToTenants)
            .innerJoin(table.tenants, eq(table.usersToTenants.tenantId, table.tenants.id))
            .leftJoin(table.employees, eq(table.employees.tenantId, table.tenants.id))
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
        const [ newTenant ] = await db.insert(table.tenants).values(tenant).returning();

        await db.insert(table.usersToTenants).values({ userId, tenantId: newTenant.id, role: 'owner' });

        return (newTenant);
    }
}
