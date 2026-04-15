import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import Elysia, { t } from "elysia";

import { table } from "../db/schema";


const _createEmployee = createInsertSchema(table.employees, {
    email: t.String({ format: "email" }),
});
const _selectEmployee = createSelectSchema(table.employees);

export const TCreateEmployee = t.Omit(_createEmployee, [ 'id', 'createdAt', 'updatedAt' ]);
export type CreateEmployee   = typeof TCreateEmployee.static;

export const TEmployee = t.Object(_selectEmployee.properties, { $id: 'Employee' });
export type Employee   = typeof TEmployee.static;

export const employeeModels = new Elysia().model({
    Employee: TEmployee,
});
