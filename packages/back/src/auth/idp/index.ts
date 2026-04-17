import { Elysia } from "elysia"
import { google } from "./google";


export const idp = new Elysia()
    .use(google);
