import { Elysia, t } from "elysia";
import { GoogleService } from "./service";


if (!process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL environment variable is not set");


export const google = new Elysia({ prefix: '/google' })
    .get('/login', ({ redirect, query: { redirectTo } }) => redirect(GoogleService.getAuthUrl(redirectTo)), {
        query: t.Object({
            redirectTo: t.Optional(t.String()),
        })
    })
    .get('/callback', async ({ query: { code, state: redirectTo }, redirect }) => {
        const { access_token, refresh_token, expires_in } = await GoogleService.getTokensFromAuthorizationCode(code);

        const url = new URL(process.env.FRONTEND_URL!);

        if (redirectTo)
            url.pathname = redirectTo;

        return (redirect(url.toString()));
    }, {
        query: t.Object({
            code: t.String(),
            state: t.Optional(t.String()),
        })
    });