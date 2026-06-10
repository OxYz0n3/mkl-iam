import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia';

import { account } from './modules/account';
import { tenants } from './modules/tenants'
import { auth } from './modules/auth';
import openapi from './openapi';
import { identityCallbacks } from './modules/tenants/identity';
import { integrationCallbacks } from './modules/tenants/integrations/callbacks';


if (!process.env.FRONTEND_URL)
  throw new Error("FRONTEND_URL must be set in environment variables");

const app = new Elysia()
  .use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }))
  .use(openapi)
  .use(integrationCallbacks)
  .use(auth)
  .use(account)
  .use(tenants)
  .use(identityCallbacks)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
