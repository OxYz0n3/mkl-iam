import useSWRMutation from "swr/mutation";
import useSWR from "swr";

import { getToken } from "@/lib/auth";
import { app } from "@/lib/api";


export function useIdentity(tenantId: string)
{
    return (useSWR([ '/api/tenants/identity', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.tenants({ tenantId }).identity.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: null }));
}

export function useDeleteIdentity(tenantId: string)
{
    return (useSWRMutation([ '/api/tenants/identity', tenantId ], async ([_, tenantId]) => {
        const { error } = await app.tenants({ tenantId }).identity.delete(undefined, {
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw new Error(error.value.message);
    }));
}

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
