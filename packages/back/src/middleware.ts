import { Elysia, } from "elysia";
import jwt from "@elysiajs/jwt";

import { UnauthorizedError } from "./utils/error";


if (!process.env['ACCESS_JWT_SECRET'])
    throw new Error("ACCESS_JWT_SECRET is not defined");

export type UserPayload = {
    id: string;
}


export const protectedMiddleware = new Elysia({ name: 'protected-middleware' })
    .use(jwt({
        name: 'accessJwt',
        secret: process.env['ACCESS_JWT_SECRET']!
    }))
    .derive({ as: 'scoped' }, async ({ headers, accessJwt }) => {
        const auth = headers.authorization;

        if (!auth?.startsWith("Bearer ")) {
            throw new UnauthorizedError("Authorization header missing");
        }

        const token = auth.slice(7);
        const payload = await accessJwt.verify(token);

        if (!payload || !payload['userId']) {
            throw new UnauthorizedError("Invalid token");
        }

        return ({
            user: { id: payload.userId } as UserPayload
        });
    });
