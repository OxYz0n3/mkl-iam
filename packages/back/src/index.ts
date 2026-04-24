import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia';

import { account } from './account';
import { tenants } from './tenants'
import { auth } from './auth';
import openapi from './openapi';
import { identityCallbacks } from './tenants/identity';


const app = new Elysia()
  .use(cors())
  .use(openapi)
  .use(auth)
  .use(account)
  .use(tenants)
  .use(identityCallbacks)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
