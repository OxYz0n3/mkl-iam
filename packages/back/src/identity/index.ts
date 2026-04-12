import { Elysia, t } from "elysia";

export const identity = new Elysia({ prefix: "/identity" })
    .get("/providers", () => [], {
        response: t.Array(t.Object({}))
    })
