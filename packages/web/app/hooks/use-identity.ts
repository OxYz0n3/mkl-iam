import useSWR from "swr";

import { getToken } from "@/lib/auth";
import { app } from "@/lib/api";

export function useIdentityProviders(tenantId: string)
{
    return (useSWR([ '/api/tenants/identity/providers', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.tenants({ tenantId }).identity.providers.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: {} as any }));
}
