import { t } from "elysia";


export const TUpdateProfile = t.Object({
    firstName: t.Optional(t.String({ minLength: 1 })),
    lastName: t.Optional(t.String({ minLength: 1 })),
    email: t.Optional(t.String({ format: "email" })),
});
export type UpdateProfile = typeof TUpdateProfile.static;
