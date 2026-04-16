import { DrizzleQueryError, eq, and, getTableColumns } from "drizzle-orm";

import { HTTPError, NotFoundError, UniqueError } from "../utils/error";
import { AddEmployee, Employee } from "./model";
import { table } from "../db/schema";
import { db } from "../db/db";


export class EmployeeService {
    static async addEmployee(newEmployee: AddEmployee): Promise<Employee>
    {
        try {
            const [ employee ] = await db.insert(table.employees).values(newEmployee).returning();

            return (employee);
        } catch (error) {
            if (error instanceof DrizzleQueryError) {
                if (error.cause?.message.includes("employees_email_tenant_id_unique")) {
                    throw new UniqueError("email");
                }
            }
            console.error(error);
            throw new HTTPError("Failed to create employee");
        }
    };

    static async deleteEmployee(id: string): Promise<void>
    {
        try {
            const result = await db.delete(table.employees).where(eq(table.employees.id, id)).returning();

            if (result.length === 0)
                throw new NotFoundError("Employee");
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to delete employee");
        }
    }

    static async getEmployees(userId: string, tenantId: string): Promise<Employee[]>
    {
        try {
            const employees = await db
                .select(getTableColumns(table.employees))
                .from(table.employees)
                .innerJoin(
                    table.usersToTenants,
                    eq(table.employees.tenantId, table.usersToTenants.tenantId),
                )
                .where(and(
                    eq(table.employees.tenantId, tenantId),
                    eq(table.usersToTenants.userId, userId),
                ));

            return (employees);
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to fetch employees");
        }
    };

    static async getEmployeeById(id: string): Promise<Employee> {
        try {
            const [ employee ] = await db.select().from(table.employees).where(eq(table.employees.id, id));

            if (!employee) {
                throw new NotFoundError("Employee");
            }
            return (employee);
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to fetch employee");
        }
    }
};
