import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';

import { app } from '@/lib/api';
import { getToken } from '@/lib/auth';

import type { UpsertRole } from '@mkl-iam/back/src/modules/tenants/roles/model';


export function useRoles(tenantId: string)
{
    return (useSWR([ '/api/roles', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.tenants({ tenantId }).roles.get({
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: [] }));
}

export function useUpsertRole(tenantId: string)
{
    return (useSWRMutation([ '/api/roles', tenantId ], async ([_, tenantId], { arg }: { arg: { roleId?: string; body: UpsertRole } }) => {
        const { roleId, body } = arg;

        const { data, error } = roleId
            ? await app.tenants({ tenantId }).roles({ roleId }).put(body, { headers: { Authorization: `Bearer ${ getToken() }` } })
            : await app.tenants({ tenantId }).roles.post(body, { headers: { Authorization: `Bearer ${ getToken() }` } });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}

export function useDeleteRole(tenantId: string)
{
    return (useSWRMutation([ '/api/roles', tenantId ], async ([_, tenantId], { arg }: { arg: string }) => {
        const { data, error } = await app.tenants({ tenantId }).roles({ roleId: arg }).delete(undefined, {
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}
