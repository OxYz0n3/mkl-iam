import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';

import { app } from '@/lib/api';
import { getToken } from '@/lib/auth';


export function useEmployees(tenantId: string)
{
    return (useSWR([ '/api/employees', tenantId ], async ([_, tenantId]) => {
        const { data, error } = await app.employees.get({
            headers: { Authorization: `Bearer ${ getToken() }` },
            query: { tenantId }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, { fallbackData: [] }));
}

export function useAddEmployee(tenantId: string)
{
    return (useSWRMutation([ '/api/employees', tenantId ], async ([_, tenantId], { arg }: { arg: Omit<Parameters<typeof app.employees.post>[0], "tenantId"> }) => {
        const { data, error } = await app.employees.post({ ...arg, tenantId }, {
            headers: { Authorization: `Bearer ${ getToken() }` },
            query: { tenantId }
        });

        if (error)
            throw new Error(error.value.message);

        return (data);
    }, {}));
}

export function useDeleteEmployee(tenantId: string)
{
    return (useSWRMutation([ '/api/employees', tenantId ], async ([_, tenantId], { arg }: { arg: string }) => {
        const { error } = await app.employees({ id: arg }).delete(undefined, {
            headers: { Authorization: `Bearer ${ getToken() }` },
            query: { tenantId }
        });

        if (error)
            throw new Error(error.value.message);
    }, {}));
}