import { eq } from "drizzle-orm";

import type { CreateTenantIdP, IdentityProviders, TenantIdPWithToken } from "./model";
import { identityProviders } from "../../utils/identity";
import { table } from "../../db/schema";
import { db } from "../../db/db";
import { HTTPError } from "../../utils/error";


export abstract class IdentityService {
    static async getProviders(tenantId: string): Promise<IdentityProviders>
    {
        return (identityProviders);
    }

    static async getTenantIdP(tenantId: string): Promise<TenantIdPWithToken | null>
    {
        try {
            const [ tenantIdP ] = await db
                .select()
                .from(table.tenantIdP)
                .where(
                    eq(table.tenantIdP.tenantId, tenantId)
                );

            return (tenantIdP ?? null);
        }
        catch (error) {
            console.error("Error fetching tenantIdP:", error);

            throw new HTTPError("Failed to fetch tenantIdP");
        }
    }

    static async deleteTenantIdP(tenantId: string): Promise<void>
    {
        try {
            await db
                .delete(table.tenantIdP)
                .where(
                    eq(table.tenantIdP.tenantId, tenantId)
                );
        } catch (error) {
            console.error("Error deleting tenantIdP:", error);

            throw new HTTPError("Failed to delete tenantIdP");
        }
    }

    static async createTenantIdP(idpData: CreateTenantIdP): Promise<TenantIdPWithToken>
    {
        try {   
            const [ tenantIdP ] = await db
                .insert(table.tenantIdP)
                .values(idpData)
                .onConflictDoUpdate({
                    target: table.tenantIdP.tenantId,
                    set: {
                        encryptedRefreshToken: idpData.encryptedRefreshToken,
                    }
                })
                .returning();
            
            return (tenantIdP);
        } catch (error) {
            console.error("Error creating tenantIdP:", error);

            throw new HTTPError("Failed to create tenantIdP");
        }
    }
};
