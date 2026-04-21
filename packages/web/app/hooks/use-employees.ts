import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';

import { app } from '@/lib/api';
import { getToken } from '@/lib/auth';


export function useEmployees(tenantId: string)
{
    return (useSWR([ '/api/employees', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.tenants({ tenantId }).employees.get({
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: [] }));
}

export function useAddEmployee(tenantId: string)
{
    return (useSWRMutation([ '/api/employees', tenantId ], async ([_, tenantId], { arg }: { arg: Parameters<ReturnType<typeof app.tenants>['employees']['post']>[0] }) => {
        const { data, error } = await app.tenants({ tenantId }).employees.post(arg, {
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}

export function useDeleteEmployee(tenantId: string)
{
    return (useSWRMutation([ '/api/employees', tenantId ], async ([_, tenantId], { arg }: { arg: string }) => {
        const { data, error } = await app.tenants({ tenantId }).employees({ employeeId: arg }).delete(undefined, {
            headers: { Authorization: `Bearer ${ getToken() }` }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }));
}
