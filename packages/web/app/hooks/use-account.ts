import useSWRMutation from "swr/mutation";
import useSWR from "swr";

import { getToken } from "@/lib/auth";
import { app } from "@/lib/api";


export function useAccount()
{
    return (useSWR('/api/account', async () => {
        const { data, error } = await app.account.profile.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw error;

        return (data);
    }));
}

export function useUpdateProfile()
{
    return (useSWRMutation('/api/account', async (_, { arg }: { arg: Parameters<typeof app.account.profile.put>[0] }) => {
        const { data, error } = await app.account.profile.put(arg, {
            headers: { Authorization: `Bearer ${ getToken() }` },
        });

        if (error)
            throw error;

        return (data);
    }));
}
