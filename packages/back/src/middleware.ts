import { Elysia, t } from "elysia";
import jwt from "@elysiajs/jwt";
import { UnauthorizedError } from "./utils/error";


if (!process.env['ACCESS_JWT_SECRET'])
    throw new Error("ACCESS_JWT_SECRET is not defined");

type UserPayload = {
    id: string;
}


export const protectedMiddleware = (app: Elysia) => 
    app.use(jwt({
        name: 'accessJwt',
        secret: process.env['ACCESS_JWT_SECRET']!
    }))
    .derive(async ({ headers, accessJwt }) => {
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