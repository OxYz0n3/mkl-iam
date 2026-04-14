import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { Static, t } from "elysia";

import { table } from "../db/schema";


const _createUser = createInsertSchema(table.users, {
    email: t.String({ format: "email" }),
});
const _selectUser = createSelectSchema(table.users);

const _selectSession = createSelectSchema(table.sessions);


export const TCreateUser = t.Omit(_createUser, [ 'createdAt', 'updatedAt' ]);
export type CreateUser   = Static<typeof TCreateUser>;

export const TUser = t.Omit(_selectUser, [ 'password' ]);
export type User   = Static<typeof TUser>;

export type Session = Static<typeof _selectSession>;

export const TLoginBody = t.Object({
    email: t.String({ format: "email" }),
    password: t.String()
});
export type LoginBody   = Static<typeof TLoginBody>;

export const TAuthCookie = t.Cookie({
    refreshToken: t.String()
});
