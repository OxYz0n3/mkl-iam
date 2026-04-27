import { DrizzleQueryError, eq, and } from "drizzle-orm";

import { BadRequestError, HTTPError, NotFoundError, UniqueError } from "../../utils/error";
import { providersServiceMap } from "../identity/providers";
import { IdentityService } from "../identity/service";
import { AddUser, TenantUser } from "./model";
import { table } from "../../db/schema";
import { db } from "../../db/db";


export class TenantUserService {
    static async addUsers(tenantId: string, newUsers: AddUser[]): Promise<TenantUser[]>
    {
        try {
            const users = await db
                .insert(table.tenantUsers)
                .values(newUsers.map((user) => ({ tenantId, ...user })))
                .onConflictDoNothing()
                .returning();

            return (users);
        } catch (error) {
            console.error(error);

            throw new HTTPError("Failed to create users");
        }
    }

    static async addUser(tenantId: string, newUser: AddUser): Promise<TenantUser>
    {
        try {
            const tenantIdP = await IdentityService.getTenantIdP(tenantId);
    
            if (!tenantIdP)
                throw new BadRequestError("No identity provider configured for this tenant");
    
            const accessToken = await providersServiceMap[tenantIdP.provider].getAccessToken(tenantId);
            const user = await providersServiceMap[tenantIdP.provider].createUser(tenantId, newUser)
            // const [ user ] = await this.addUsers(tenantId, [ newUser ]);

            // if (!user)
            //     throw new HTTPError("Failed to create user");

            return (user);
        } catch (error) {
            if (error instanceof DrizzleQueryError)
                if (error.cause?.message.includes("tenant_users_primary_email_tenant_id_unique"))
                    throw new UniqueError("primaryEmail");

            console.error(error);
            throw new HTTPError("Failed to create user");
        }
    };

    static async deleteUser(tenantId: string, userId: string): Promise<TenantUser>
    {
        try {
            const [ user ] = await db
                .delete(table.tenantUsers)
                .where(and(
                    eq(table.tenantUsers.tenantId, tenantId),
                    eq(table.tenantUsers.id, userId)))
                .returning();

            if (!user)
                throw new NotFoundError("User not found");

            return (user);
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to delete user");
        }
    }

    static async getUsers(tenantId: string): Promise<TenantUser[]>
    {
        try {
            const users = await db
                .select()
                .from(table.tenantUsers)
                .where(
                    eq(table.tenantUsers.tenantId, tenantId)
                );

            return (users);
        } catch (error) {
            console.error(error);
            throw new HTTPError("Failed to fetch users");
        }
    };

    static async getUserById(userId: string): Promise<TenantUser> {
        try {
            const [ user ] = await db
                .select()
                .from(table.tenantUsers)
                .where(
                    eq(table.tenantUsers.id, userId)
                );

            if (!user)
                throw new NotFoundError("User not found");

            return (user);
        } catch (error) {
            if (error instanceof NotFoundError)
                throw error;

            console.error(error);
            throw new HTTPError("Failed to fetch user");
        }
    }

    static async syncUsers(tenantId: string): Promise<TenantUser[]>
    {
        try {
            const tenantIdP = await IdentityService.getTenantIdP(tenantId);
    
            if (!tenantIdP)
                throw new BadRequestError("No identity provider configured for this tenant");
    
            const accessToken = await providersServiceMap[tenantIdP.provider].getAccessToken(tenantId);
            const users = await providersServiceMap[tenantIdP.provider].getUsers(tenantId, accessToken);
    
            const addedUsers = await TenantUserService.addUsers(tenantId, users);
    
            return (addedUsers);

        } catch (error) {
            console.error(error);

            throw new HTTPError("Failed to sync users");
        }
    }
};
