import { openapi } from '@elysiajs/openapi'
import { cors } from '@elysiajs/cors'
import { Elysia } from "elysia";

import { employees } from "./employees";
import { tenants } from "./tenants"
import { auth } from "./auth";

const app = new Elysia()
  .use(cors())
  .use(openapi({
    path: '/docs',
  }))
  .use(auth)
  .use(tenants)
  .use(employees)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
