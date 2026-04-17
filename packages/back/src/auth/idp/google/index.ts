import { Elysia, t } from "elysia";
import { jwt} from "@elysiajs/jwt";

import { GoogleService } from "./service";
import { protectedMiddleware } from "../../../middleware";
import { HTTPError } from "../../../utils/error";


if (!process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL environment variable is not set");


export const google = new Elysia({ prefix: '/google' })
    .use(jwt({
        name: 'idpJwt',
        secret: process.env.JWT_SECRET!,
        exp: '5m',
    }))
    .get('/callback', async ({ redirect, query: { code, state }, idpJwt }) => {
        const { access_token, refresh_token, expires_in } = await GoogleService.getTokensFromAuthorizationCode(code);
        const statePayload = await idpJwt.verify(state);

        if (!statePayload || !statePayload['tenantId'] || !statePayload['redirectTo'] || !statePayload['userId'])
            throw new HTTPError("Invalid state parameter");

        //TODO: Verify that tenantId is valid and that the user has access to it
        const { tenantId, redirectTo, userId } = statePayload as { tenantId: string, redirectTo: string, userId: string };
        console.log("State payload:", statePayload);

        await GoogleService.createTenantIdP({
            provider: 'google',
            encryptedRefreshToken: refresh_token,  // TODO: Encrypt this token before storing
            tenantId,
        })

        const url = new URL(process.env.FRONTEND_URL!);

        if (redirectTo)
            url.pathname = redirectTo;

        return (redirect(url.toString()));
    }, {
        query: t.Object({
            code: t.String(),
            state: t.String(),
        })
    })
    .use(protectedMiddleware)
    .get('/login', async ({ redirect, query: { redirectTo, tenantId }, user, idpJwt }) => {
        const state = await idpJwt.sign({ tenantId, redirectTo, userId: user.id });
        // TODO: Verify that tenantId is valid and that the user has access to it
        redirect(GoogleService.getAuthUrl(state))
    }, {
        query: t.Object({
            redirectTo: t.Optional(t.String()),
            tenantId: t.String(),
        })
    })