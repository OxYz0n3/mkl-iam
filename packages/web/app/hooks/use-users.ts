import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';

import { app } from '@/lib/api';
import { getToken } from '@/lib/auth';


export function useUsers(tenantId: string)
{
    return (useSWR([ '/api/users', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.tenants({ tenantId }).users.get({
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: [] }));
}

export function useAddUser(tenantId: string)
{
    return (useSWRMutation([ '/api/users', tenantId ], async ([_, tenantId], { arg }: { arg: Parameters<ReturnType<typeof app.tenants>['users']['post']>[0] }) => {
        const { data, error } = await app.tenants({ tenantId }).users.post(arg, {
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}

export function useDeleteUser(tenantId: string)
{
    return (useSWRMutation([ '/api/users', tenantId ], async ([_, tenantId], { arg }: { arg: string }) => {
        const { data, error } = await app.tenants({ tenantId }).users({ userId: arg }).delete(undefined, {
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}

export function useSyncUsers(tenantId: string)
{
    return (useSWRMutation([ '/api/users', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.tenants({ tenantId }).users.sync.post(undefined, {
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}
