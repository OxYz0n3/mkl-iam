import type { AddIntegration, Integration } from "../../modules/tenants/integrations/model";
import type { TenantUser } from "../../modules/tenants/users/model";

import { NotImplementedError } from "../../lib/error";
import { OAuthService } from "../oauth";
import { table } from "../../db/schema";
import { db } from "../../db/db";


export class TenantIntegrationService extends OAuthService
{
    static async createTenantIntegration(integrationData: AddIntegration): Promise<Integration>
    {
        try {
            const [ tenantIntegration ] = await db.insert(table.tenantIntegrations).values(integrationData).onConflictDoUpdate({
                target: [ table.tenantIntegrations.tenantId, table.tenantIntegrations.app ],
                set: {
                    metadata: integrationData.metadata ?? {},
                    updatedAt: new Date(),
                }
            }).returning();

            return (tenantIntegration);
        } catch (error) {
            console.error("Error while creating integration:", error);

            throw new Error("Failed to create integration");
        }
    }

    static async createAccount(user: TenantUser): Promise<void>
    {
        throw new NotImplementedError();
    }

    static async getResources(metadata: any): Promise<any>
    {
        throw new NotImplementedError();
    }

    static async isConfigValid(config: any): Promise<boolean>
    {
        return (false);
    }
}
