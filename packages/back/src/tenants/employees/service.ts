import { DrizzleQueryError, eq, and, getTableColumns } from "drizzle-orm";

import { HTTPError, NotFoundError, UniqueError } from "../../utils/error";
import { AddEmployee, Employee } from "./model";
import { table } from "../../db/schema";
import { db } from "../../db/db";


export class EmployeeService {
    static async addEmployee(tenantId: string, newEmployee: AddEmployee): Promise<Employee>
    {
        try {
            const [ employee ] = await db
                .insert(table.employees)
                .values({ tenantId, ...newEmployee })
                .returning();

            return (employee);
        } catch (error) {
            if (error instanceof DrizzleQueryError)
                if (error.cause?.message.includes("employees_email_tenant_id_unique"))
                    throw new UniqueError("email");

            console.error(error);
            throw new HTTPError("Failed to create employee");
        }
    };

    static async deleteEmployee(tenantId: string, employeeId: string): Promise<Employee>
    {
        try {
            const [ employee ] = await db
                .delete(table.employees)
                .where(and(
                    eq(table.employees.tenantId, tenantId),
                    eq(table.employees.id, employeeId)))
                .returning();

            if (!employee)
                throw new NotFoundError("Employee not found");

            return (employee);
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to delete employee");
        }
    }

    static async getEmployees(tenantId: string): Promise<Employee[]>
    {
        try {
            const employees = await db
                .select()
                .from(table.employees)
                .where(
                    eq(table.employees.tenantId, tenantId)
                );

            return (employees);
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to fetch employees");
        }
    };

    static async getEmployeeById(employeeId: string): Promise<Employee> {
        try {
            const [ employee ] = await db
                .select()
                .from(table.employees)
                .where(
                    eq(table.employees.id, employeeId)
                );

            if (!employee)
                throw new NotFoundError("Employee not found");

            return (employee);
        } catch (error) {
            if (error instanceof NotFoundError)
                throw error;

            console.error(error);
            throw new HTTPError("Failed to fetch employee");
        }
    }
};
