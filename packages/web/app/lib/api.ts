import { treaty } from '@elysiajs/eden';

import type { App } from '@mkl-iam/back';
import { getToken } from './auth';


export const app = treaty<App>('http://localhost:3000');
