import { DrizzleQueryError, eq } from "drizzle-orm";

import { BadRequestError, HTTPError, UniqueError } from "../utils/error";
import { UpdateProfile } from "./model";
import { table } from "../db/schema";
import { User } from "../auth/model";
import { db } from "../db/db";


export class AccountService
{
    static async updateProfile(userId: string, data: UpdateProfile): Promise<User>
    {
        try {
            const [ user ] = await db.update(table.users)
                .set({ 
                    ...data,
                    updatedAt: new Date()
                })
                .where(eq(table.users.id, userId))
                .returning();

            return (user);
        } catch (error) {
            if (error instanceof DrizzleQueryError) {
                if (error.cause?.message.includes("users_email_unique")) {
                    throw new UniqueError("email");
                }
            }

            if (error instanceof BadRequestError || error instanceof UniqueError)
                throw error;

            console.error(error);
            throw new HTTPError("Failed to update profile");
        }
    }
}
