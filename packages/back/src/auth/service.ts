import { DrizzleQueryError } from "drizzle-orm/errors";
import { jwt } from "@elysiajs/jwt";
import { eq } from "drizzle-orm";

import { BadRequestError, HTTPError, UniqueError } from "../utils/error";
import { CreateUser, LoginBody, User } from "./model";
import { table } from "../db/schema";
import { db } from "../db/db";


export class AuthService {
    static async login(body: LoginBody, accessJwt: any, refreshJwt: any): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const [ user ] = await db.select().from(table.users).where(eq(table.users.email, body.email));
    
            if (!user)
                throw new BadRequestError("Invalid email or password");
    
            const isValid = await Bun.password.verify(body.password, user.password);
    
            if (!isValid)
                throw new BadRequestError("Invalid email or password");

            const refreshToken = await refreshJwt.sign({ id: user.id });
            const accessToken  = await accessJwt.sign({ id: user.id });

            return { refreshToken, accessToken };
        } catch (error) {
            if (error instanceof BadRequestError)
                throw error;

            console.error(error);
            throw new HTTPError("Failed to login");
        }
    }

    static async register(user: CreateUser): Promise<User> {
        try {
            const hash = await Bun.password.hash(user.password);

            const [ newUser ] = await db.insert(table.users).values({ ...user, password: hash }).returning();

            return (newUser);
        } catch (error) {
            if (error instanceof DrizzleQueryError) {
                if (error.cause?.message.includes("users_email_unique")) {
                    throw new UniqueError("email");
                }
            }
            console.error(error);

            throw new HTTPError("Failed to register user");
        }
    }
};
