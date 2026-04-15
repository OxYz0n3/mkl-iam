import { Elysia, t } from "elysia";

import { employeeModels, TCreateEmployee } from "./model";
import { protectedMiddleware } from "../middleware";
import { EmployeeService } from "./service";


export const employees = new Elysia({ prefix: "/employees", tags: [ "Employees" ] })
    .use(protectedMiddleware)
    .use(employeeModels)
    .get("/:id", ({ params: { id } }) => EmployeeService.getEmployeeById(id), {
        params: t.Object({
            id: t.String({ format: 'uuid' }),
        }),
        response: {
            200: 'Employee',
        },
    })
    .get("/", ({ user, query: { tenantId } }) => EmployeeService.getEmployees(user.id, tenantId), {
        query: t.Object({
            tenantId: t.String({ format: 'uuid' }),
        }),
        response: {
            200: t.Array(t.Ref('Employee')),
        },
    })
    .post("/", ({ body }) => EmployeeService.createEmployee(body), {
        body: TCreateEmployee,
        response: {
            201: 'Employee',
        },
    })
