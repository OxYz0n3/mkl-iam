import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";

import { table } from "../db/schema";


const _createEmployee = createInsertSchema(table.employees, {
    email: t.String({ format: "email" }),
});
const _selectEmployee = createSelectSchema(table.employees);

export const TCreateEmployee = t.Omit(_createEmployee, [ 'id', 'createdAt', 'updatedAt' ]);
export type CreateEmployee = Static<typeof TCreateEmployee>;

export const TEmployee = _selectEmployee;
export type Employee  = Static<typeof TEmployee>;
