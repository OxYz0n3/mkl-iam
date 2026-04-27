import { redis, randomUUIDv7 } from "bun";

import { IdentityService } from "../tenants/identity/service";
import { AddUser } from "../tenants/users/model";


export abstract class OAuthService
{
    protected static AUTH_URL: string;
    protected static CLIENT_ID: string;
    protected static REDIRECT_URI: string;
    protected static SCOPE: string;
    protected static TOKEN_URL: string;
    protected static CLIENT_SECRET: string;

    static getAuthUrl(state: string): string
    {
        const url = new URL(this.AUTH_URL);

        url.searchParams.set('client_id', this.CLIENT_ID);
        url.searchParams.set('redirect_uri', this.REDIRECT_URI);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', this.SCOPE);
        url.searchParams.set('access_type', 'offline');  // Request refresh token
        url.searchParams.set('prompt', 'consent');  // Force consent to get refresh token
        url.searchParams.set('state', state);

        return (url.toString());
    }

    static async getTokensFromAuthorizationCode(tenantId: string, code: string): Promise<{ access_token: string; refresh_token: string; }>
    {
        const response = await fetch(this.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

        if (tokenData.scope != this.SCOPE)
            throw new Error(`Invalid scope: ${tokenData.scope}`);

        await redis.set(`idp_access_token:${ tenantId }`, tokenData.access_token, 'EX', tokenData.expires_in - 60);  // Cache access token, set to expire slightly before actual expiration

        return (tokenData);
    }

    static async createNonce(): Promise<string>
    {
        const nonce = randomUUIDv7();

        await redis.set(`nonce:${ nonce }`, 'valid', 'EX', 10 * 60);  // Store nonce in Redis with 10 minute expiration

        return (nonce);
    }

    static async verifyNonce(nonce: string): Promise<boolean>
    {
        const cachedNonce = await redis.get(`nonce:${nonce}`);

        if (!cachedNonce)
            return (false);

        await redis.del(`nonce:${nonce}`);

        return (true);
    }

    static async getAccessToken(tenantId: string): Promise<string>
    {
        const cachedToken = await redis.get(`idp_access_token:${ tenantId }`);

        if (cachedToken)
            return (cachedToken);

        const tenantIdP = await IdentityService.getTenantIdP(tenantId);

        if (!tenantIdP)
            throw new Error("No identity provider configured for this tenant");

        const response = await fetch(this.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET,
                refresh_token: tenantIdP.encryptedRefreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok)
            throw new Error(`Failed to exchange refresh token for access token: ${await response.text()}`);

        const tokenData = await response.json();

        if (tokenData.scope != this.SCOPE)
            throw new Error(`Invalid scope: ${tokenData.scope}`);

        await redis.set(`idp_access_token:${ tenantId }`, tokenData.access_token, 'EX', tokenData.expires_in - 60);  // Cache access token, set to expire slightly before actual expiration

        return (tokenData.access_token);
    }

    static async getUsers(tenantId: string, accessToken: string): Promise<AddUser[]>
    {
        return ([]);
    }

    static async createUser(tenantId: string, newUser: AddUser): Promise<AddUser>
    {
        throw new Error("Not implemented");
    }
}
