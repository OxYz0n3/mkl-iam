import { and, eq } from "drizzle-orm";

import type { AvailableIntegrations, Integration } from "./model";

import { NotFoundError } from "../../../lib/error";
import { integrations } from "../../../providers/apps/registry";
import { table } from "../../../db/schema";
import { db } from "../../../db/db";


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
