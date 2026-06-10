import { and, eq } from "drizzle-orm";

import type { AvailableIntegrations, Integration, AddIntegration } from "./model";
import type { TenantUser } from "../users/model";

import { NotFoundError, NotImplementedError } from "../../utils/error";
import { OAuthService } from "../../utils/oauth_service";
import { integrations } from "../../utils/integrations";
import { table } from "../../db/schema";
import { db } from "../../db/db";


export abstract class IntegrationService
{
    static async getIntegrations(tenantId: string): Promise<{ addedIntegrations: Integration[]; availableIntegrations: AvailableIntegrations }>
    {
        const addedIntegrations = await db.select().from(table.tenantIntegrations).where(eq(table.tenantIntegrations.tenantId, tenantId));

        return ({
            addedIntegrations,
            availableIntegrations: integrations
        });
    }

    static async getIntegrationById(tenantId: string, integrationId: string)
    {
        const [ integration ] = await db.select().from(table.tenantIntegrations).where(and(eq(table.tenantIntegrations.id, integrationId), eq(table.tenantIntegrations.tenantId, tenantId)));

        if (!integration)
            throw new NotFoundError("Integration not found");

        return (integration);
    }

    static async deleteIntegration(tenantId: string, integrationId: string): Promise<void>
    {
        const [ deletedIntegration ] = await db.delete(table.tenantIntegrations).where(and(eq(table.tenantIntegrations.id, integrationId), eq(table.tenantIntegrations.tenantId, tenantId))).returning();

        if (!deletedIntegration)
            throw new Error("Integration not found");
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
}
