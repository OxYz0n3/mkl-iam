import { app } from "@/lib/api";
import { getToken } from "@/lib/auth";
import useSWR from "swr";

export function useIntegrations(tenantId: string)
{
    return (useSWR([ '/api/integrations', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.integrations.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
            query: { tenantId }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: { addedIntegrations: [], availableIntegrations: {} } }));
}
