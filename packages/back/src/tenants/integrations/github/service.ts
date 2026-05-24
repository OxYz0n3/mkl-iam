import { redis } from "bun";

import { TenantIntegrationService } from "../service";


if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET)
    throw new Error("GitHub Client ID and Secret must be set in environment variables");


export class GitHubService extends TenantIntegrationService
{
    protected static AUTH_URL = 'https://github.com/login/oauth/authorize';
    protected static CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
    protected static CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
    protected static REDIRECT_URI = 'http://localhost:3000/integrations/github/callback';
    protected static SCOPE = 'read:org admin:org user:email';
    protected static TOKEN_URL = 'https://github.com/login/oauth/access_token';

    static getAuthUrl(state: string): string
    {
        const url = new URL(this.AUTH_URL);

        url.searchParams.set('client_id', this.CLIENT_ID);
        url.searchParams.set('redirect_uri', this.REDIRECT_URI);
        url.searchParams.set('scope', this.SCOPE);
        url.searchParams.set('state', state);

        return (url.toString());
    }

    static async getTokensFromAuthorizationCode(tenantId: string, code: string): Promise<{ access_token: string; refresh_token: string; }>
    {
        const response = await fetch(this.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: new URLSearchParams({
                code: code,
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET,
                redirect_uri: this.REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok)
            throw new Error(`Failed to exchange authorization code for tokens: ${await response.text()}`);

        const tokenData = await response.json();

        // GitHub OAuth Apps don't issue refresh tokens — tokens don't expire
        return ({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || '',
        });
    }

    static async getAccessToken(tenantId: string): Promise<string>
    {
        const cachedToken = await redis.get(`integration_access_token:github:${tenantId}`);

        if (cachedToken)
            return (cachedToken);

        // GitHub OAuth tokens don't expire — retrieve from DB directly
        const { db } = await import("../../db/db");
        const { table } = await import("../../db/schema");
        const { eq, and } = await import("drizzle-orm");

        const [ integration ] = await db.select().from(table.tenantIntegrations).where(
            and(eq(table.tenantIntegrations.tenantId, tenantId), eq(table.tenantIntegrations.app, 'github'))
        );

        if (!integration || !integration.encryptedRefreshToken)
            throw new Error("No GitHub integration found for this tenant");

        // For GitHub, encryptedRefreshToken actually stores the access token
        // (GitHub OAuth Apps don't have refresh tokens)
        const accessToken = integration.encryptedRefreshToken;

        await redis.set(`integration_access_token:github:${tenantId}`, accessToken, 'EX', 3600);

        return (accessToken);
    }
}
