import { treaty } from '@elysiajs/eden';

import type { App } from '@mkl-iam/back';


export const app = treaty<App>('http://localhost:3000');
