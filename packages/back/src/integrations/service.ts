import { eq } from "drizzle-orm";

import { AvailableIntegrations, Integration, AddIntegration } from "./model";
import { integrations } from "../utils/integrations";
import { table } from "../db/schema";
import { db } from "../db/db";
import { OAuthService } from "../auth/idp/service";


export class IntegrationService
{
    static async getIntegrations(tenantId: string): Promise<{ addedIntegrations: Integration[]; availableIntegrations: AvailableIntegrations }>
    {
        const addedIntegrations = await db.select().from(table.tenantIntegrations).where(eq(table.tenantIntegrations.tenantId, tenantId));

        return ({
            addedIntegrations,
            availableIntegrations: integrations
        });
    }
}

export class TenantIntegrationService extends OAuthService
{
    static async createTenantIntegration(integrationData: AddIntegration): Promise<Integration>
    {
        try {   
            const [ tenantIntegration ] = await db.insert(table.tenantIntegrations).values(integrationData).onConflictDoUpdate({
                target: [ table.tenantIntegrations.tenantId, table.tenantIntegrations.app ],
                set: {
                    encryptedRefreshToken: integrationData.encryptedRefreshToken,
                }
            }).returning();

            return (tenantIntegration);
        } catch (error) {
            console.error("Error while creating integration:", error);

            throw new Error("Failed to create integration");
        }
    }
}

