import useSWRMutation from 'swr/mutation';
import { app } from "@/lib/api";
import { getToken } from "@/lib/auth";
import useSWR from "swr";

export function useIntegrations(tenantId: string)
{
    return (useSWR([ '/api/integrations', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.tenants({ tenantId }).integrations.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: { addedIntegrations: [], availableIntegrations: {} } }));
}

export function useIntegrationResources(tenantId: string, integrationId: string)
{
    return (useSWR(integrationId ? [ '/api/integration-resources', tenantId, integrationId ] : null, async ([_, tenantId, integrationId]) => {
        const { data, error } = await app.tenants({ tenantId }).integrations({ integrationId }).resources.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: { resources: [] } }));
}

export function useDeleteIntegration(tenantId: string)
{
    return (useSWRMutation([ '/api/integrations', tenantId ], async ([_, tenantId], { arg }: { arg: string }) => {
        const { data, error } = await app.tenants({ tenantId }).integrations({ integrationId: arg }).delete(undefined, {
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}
