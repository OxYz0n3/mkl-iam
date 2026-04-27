import useSWRMutation from "swr/mutation";
import useSWR from "swr";

import { getToken } from "@/lib/auth";
import { app } from "@/lib/api";


export function useTenants()
{
    return (useSWR('/api/tenants', async () => {
        const { data, error } = await app.tenants.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw error;

        return (data);
    }, { fallbackData: [] }));
}

export function useAddTenant()
{
    return (useSWRMutation('/api/tenants', async (_, { arg }: { arg: Parameters<typeof app.tenants.post>[0] }) => {
        const { data, error } = await app.tenants.post(arg, {
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}