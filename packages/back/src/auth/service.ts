import { DrizzleQueryError } from "drizzle-orm/errors";
import { eq, and, gt } from "drizzle-orm";

import { BadRequestError, HTTPError, UniqueError } from "../utils/error";
import { CreateUser, LoginBody, Session, User } from "./model";
import { table } from "../db/schema";
import { db } from "../db/db";


export class AuthService {
    static async findUserById(id: string): Promise<User>
    {
        const [ user ] = await db.select().from(table.users).where(eq(table.users.id, id));

        if (!user)
            throw new BadRequestError("User not found");

        return (user);
    }

    static async refreshSession(sessionId: string): Promise<Session>
    {
        try {
            const [ session ] = await db.update(table.sessions)
                .set({ 'expiresAt': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
                .where(and(eq(table.sessions.id, sessionId), gt(table.sessions.expiresAt, new Date())))
                .returning();

            if (!session)
                throw new BadRequestError("Invalid session");

            return (session);
        } catch (error) {
            if (error instanceof BadRequestError)
                throw error;

            console.error(error);
            throw new HTTPError("Failed to get session");
        }
    }

    static async login(body: LoginBody, accessJwt: any, refreshJwt: any): Promise<{ user: User, accessToken: string, refreshToken: string }> {
        try {
            const [ user ] = await db.select().from(table.users).where(eq(table.users.email, body.email));
    
            if (!user)
                throw new BadRequestError("Invalid email or password");
    
            const isValid = await Bun.password.verify(body.password, user.password);
    
            if (!isValid)
                throw new BadRequestError("Invalid email or password");

            const [ session ] = await db.insert(table.sessions).values({
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                userId: user.id,
                userAgent: "Unknown", // You can enhance this by passing the user agent from the request
            }).returning();

            const refreshToken = await refreshJwt.sign({ sessionId: session.id });
            const accessToken  = await accessJwt.sign({ userId: user.id });

            return ({ user, refreshToken, accessToken });
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

            if (error instanceof BadRequestError || error instanceof UniqueError)
                throw error;

            console.error(error);
            throw new HTTPError("Failed to register user");
        }
    }

    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
        try {
            const [ user ] = await db.select().from(table.users).where(eq(table.users.id, userId));

            if (!user)
                throw new BadRequestError("User not found");

            const isValid = await Bun.password.verify(currentPassword, user.password);

            if (!isValid)
                throw new BadRequestError("Current password is incorrect");

            const hash = await Bun.password.hash(newPassword);

            const [ updatedUser ] = await db.update(table.users)
                .set({ 
                    password: hash,
                    updatedAt: new Date()
                })
                .where(eq(table.users.id, userId))
                .returning();

            return (updatedUser);
        } catch (error) {
            if (error instanceof BadRequestError)
                throw error;

            console.error(error);
            throw new HTTPError("Failed to change password");
        }
    }
};
