import { Elysia, t } from "elysia";
import { jwt} from "@elysiajs/jwt";

import { TAuthCookie, TCreateUser, TLoginBody } from "./model";
import { ForbiddenError } from "../utils/error";
import { AuthService } from "./service";


if (!process.env['ACCESS_JWT_SECRET'] || !process.env['REFRESH_JWT_SECRET'])
    throw new Error("ACCESS_JWT_SECRET and REFRESH_JWT_SECRET must be defined");


export const auth = new Elysia({ prefix: "/auth", tags: [ "Auth" ] })
    .use(jwt({
        name: 'accessJwt',
        secret: process.env['ACCESS_JWT_SECRET'],
        exp: '1h',
    }))
    .use(jwt({
        name: 'refreshJwt',
        secret: process.env['REFRESH_JWT_SECRET'],
        exp: '7d',
    }))
    .post("/login", async ({ body, cookie, accessJwt, refreshJwt }) => {
        const { accessToken, refreshToken } = await AuthService.login(body, accessJwt, refreshJwt);

        cookie.refreshToken.set({
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            sameSite: "strict",
        });

        return ({ accessToken });
    }, {
        cookie: t.Optional(TAuthCookie),
        body: TLoginBody,
        response: t.Object({
            accessToken: t.String(),
        }),
    })
    .post("/register", ({ body }) => AuthService.register(body), {
        body: TCreateUser
    })
    .post("/refresh", async ({ accessJwt, refreshJwt, cookie: { refreshToken } }) => {
        const payload = await refreshJwt.verify(refreshToken.value);

        if (!payload)
            throw new ForbiddenError("Invalid or expired refresh token");

        const userId = payload['id'] as number;
        const accessToken = await accessJwt.sign({ id: userId });

        return ({ accessToken });
    }, {
        cookie: TAuthCookie,
        response: t.Object({
            accessToken: t.String(),
        }),
    });
