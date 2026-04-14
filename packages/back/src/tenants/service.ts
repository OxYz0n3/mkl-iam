import { arrayContains, eq } from "drizzle-orm";

import { table } from "../db/schema";
import { db } from "../db/db";
import { CreateTenant, Tenant, UserToTenant } from "./model";


export class TenantService
{
    static async getUserTenants(userId: string): Promise<{ tenant: Tenant, role: UserToTenant['role'], joinedAt: UserToTenant['joinedAt'] }[]>
    {
        // await new Promise(resolve => setTimeout(resolve, 3000));
        const tenants = await db.
            select({
                tenant: table.tenants,
                role: table.usersToTenants.role,
                joinedAt: table.usersToTenants.joinedAt,
            })
            .from(table.usersToTenants)
            .innerJoin(table.tenants, eq(table.usersToTenants.tenantId, table.tenants.id))
            .where(eq(table.usersToTenants.userId, userId))

        console.log(tenants);

        return (tenants);
    }

    static async addTenant(userId: string, tenant: CreateTenant): Promise<Tenant>
    {
        const [ newTenant ] = await db.insert(table.tenants).values(tenant).returning();

        await db.insert(table.usersToTenants).values({ userId, tenantId: newTenant.id, role: 'owner' });

        return (newTenant);
    }
}
