import { DrizzleQueryError, eq } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { CreateEmployee, Employee } from "./model";
import { HTTPError, NotFoundError, UniqueError } from "../utils/error";

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

    static async getEmployees(): Promise<Employee[]> {
        try {
            const employees = await db.select().from(table.employees);

            return (employees);
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to fetch employees");
        }
    };

    static async getEmployeeById(id: number): Promise<Employee> {
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
