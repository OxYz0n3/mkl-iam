import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";

import { authModels, TAuthCookie, TChangePassword, TCreateUser, TLoginBody } from "./model";
import { protectedMiddleware } from "../middleware";
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
    .use(authModels)
    .post("/login", async ({ body, cookie, accessJwt, refreshJwt }) => {
        const { user, accessToken, refreshToken } = await AuthService.login(body, accessJwt, refreshJwt);

        cookie.refreshToken.set({
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            sameSite: "strict",
        });

        return ({ user, accessToken });
    }, {
        body: TLoginBody,
        response: {
            200: t.Object({
                accessToken: t.String(),
                user: t.Ref('User'),
            }),
            400: t.Object({
                error: t.Literal("Invalid email or password"),
            })
        }
    })
    .post("/register", ({ body }) => AuthService.register(body), {
        body: TCreateUser
    })
    .post("/refresh", async ({ accessJwt, refreshJwt, cookie: { refreshToken } }) => {
        const payload = await refreshJwt.verify(refreshToken.value);

        if (!payload || !payload['sessionId']) {
            refreshToken.remove();
            throw new ForbiddenError("Invalid or expired refresh token");
        }

        const sessionId = payload['sessionId'] as string;

        try {
            const session = await AuthService.refreshSession(sessionId);

            const accessToken = await accessJwt.sign({ userId: session.userId });
            const user = await AuthService.findUserById(session.userId);

            // Update refresh token expiration
            refreshToken.update({
                maxAge: 7 * 24 * 60 * 60,
            });

            return ({ user, accessToken });
        } catch (error) {
            refreshToken.remove();
            console.error(error);
            throw new ForbiddenError("Invalid or expired refresh token");
        }
    }, {
        cookie: TAuthCookie,
        response: {
            200: t.Object({
                accessToken: t.String(),
                user: t.Ref('User'),
            }),
        }
    })
    .post("/logout", ({ cookie: { refreshToken } }) => {
        refreshToken.remove();

        return ({ message: "Logged out successfully" });
    }, {
        cookie: TAuthCookie,
        response: t.Object({
            message: t.Literal("Logged out successfully"),
        }),
    })
    .use(protectedMiddleware)
    .post("/change-password", async ({ body, user }) => {
        await AuthService.changePassword(user.id, body.currentPassword, body.newPassword);
        return { message: "Password changed successfully" };
    }, {
        body: TChangePassword,
        response: {
            200: t.Object({
                message: t.Literal("Password changed successfully"),
            }),
        }
    });
