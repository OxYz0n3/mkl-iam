import Elysia from "elysia";
import { protectedMiddleware } from "../middleware";
import { TUpdateProfile } from "./model";
import { authModels } from "../auth/model";
import { AccountService } from "./service";

export const account = new Elysia({ prefix: "/account", tags: [ "Account" ] })
    .use(protectedMiddleware)
    .use(authModels)
    .put("/profile", ({ user, body }) => AccountService.updateProfile(user.id, body), {
        body: TUpdateProfile,
        response: {
            200: 'User',
        }
    });
