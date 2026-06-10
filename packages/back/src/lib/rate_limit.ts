import { redis } from "bun";

import { TooManyRequestsError } from "./error";


/**
 * Fixed-window rate limiter backed by Redis, keyed by route + IP.
 * Safe across multiple API instances. Standard INCR + EXPIRE pattern:
 * the counter is created with the first hit and expires after the window.
 */
export function rateLimit(limit: number, windowMs: number) {
    return async ({ request, server }: { request: Request; server: any }) => {
        const ip = server?.requestIP?.(request)?.address
            ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            ?? 'unknown';

        const key = `rate_limit:${ new URL(request.url).pathname }:${ ip }`;
        const count = await redis.incr(key);

        if (count === 1)
            await redis.expire(key, Math.ceil(windowMs / 1000));

        if (count > limit)
            throw new TooManyRequestsError();
    };
}
