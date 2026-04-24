
import type { CreateTenantIdP, IdentityProviders, TenantIdP } from "./model";
import { identityProviders } from "../../utils/identity";
import { table } from "../../db/schema";
import { db } from "../../db/db";


export abstract class IdentityService {
    static async getProviders(tenantId: string): Promise<IdentityProviders>
    {
        return (identityProviders);
    }

    static async createTenantIdP(idpData: CreateTenantIdP): Promise<TenantIdP>
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

            throw new Error("Failed to create tenantIdP");
        }
    }
};
