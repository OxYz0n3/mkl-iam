import { Elysia, t } from "elysia";

import { TCreateEmployee, TEmployee } from "./model";
import { protectedMiddleware } from "../middleware";
import { EmployeeService } from "./service";


export const employees = new Elysia({ prefix: "/employees", tags: [ "Employees" ] })
    .use(protectedMiddleware)
    .get("/:id", ({ params: { id } }) => EmployeeService.getEmployeeById(id), {
        params: t.Object({
            id: t.Number(),
        }),
        response: TEmployee,
    })
    .get("/", ({ user }) => { console.log(user) ;return EmployeeService.getEmployees() }, {
        response: t.Array(TEmployee),
    })
    .post("/", ({ body }) => EmployeeService.createEmployee(body), {
        body: TCreateEmployee,
        response: TEmployee,
    })
