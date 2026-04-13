import { openapi } from '@elysiajs/openapi'
import { cors } from '@elysiajs/cors'
import { Elysia } from "elysia";

import { employees } from "./employees/index";
import { auth } from "./auth";


const app = new Elysia()
  .use(cors())
  .use(openapi({
    path: '/docs',
  }))
  .use(auth)
  .use(employees)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
