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
