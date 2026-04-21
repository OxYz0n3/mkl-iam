import { Elysia, t } from "elysia";

import { employeeModels, TAddEmployee } from "./model";
import { EmployeeService } from "./service";


export const employees = new Elysia({ prefix: "/employees", tags: [ "Tenants / Employees" ] })
    .use(employeeModels)
    .get("/:employeeId", ({ params: { employeeId } }) => EmployeeService.getEmployeeById(employeeId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            employeeId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'Employee',
        },
    })
    .get("/", ({ params: { tenantId } }) => EmployeeService.getEmployees(tenantId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.Array(t.Ref('Employee')),
        },
    })
    .post("/", ({ body, params: { tenantId } }) => EmployeeService.addEmployee(tenantId, body), {
        body: TAddEmployee,
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            201: 'Employee',
        },
    })
    .delete("/:employeeId", ({ params: { tenantId, employeeId } }) => EmployeeService.deleteEmployee(tenantId, employeeId), {
        params: t.Object({
            tenantId: t.String({ format: 'uuid' }),
            employeeId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'Employee'
        },
    });
