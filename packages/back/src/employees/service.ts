import { DrizzleQueryError, eq, and, getTableColumns } from "drizzle-orm";

import { HTTPError, NotFoundError, UniqueError } from "../utils/error";
import { CreateEmployee, Employee } from "./model";
import { table } from "../db/schema";
import { db } from "../db/db";
import { employees } from ".";


export class EmployeeService {
    static async createEmployee(newEmployee: CreateEmployee): Promise<Employee> {
        try {
            const [ employee ] = await db.insert(table.employees).values(newEmployee).returning();

            return (employee);
        } catch (error) {
            if (error instanceof DrizzleQueryError) {
                if (error.cause?.message.includes("employee_email_unique")) {
                    throw new UniqueError("email");
                }
            }
            console.error(error);
            throw new HTTPError("Failed to create employee");
        }
    };

    static async getEmployees(userId: string, tenantId: string): Promise<Employee[]> {
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
