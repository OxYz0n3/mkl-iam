import { eq } from "drizzle-orm";

import { CreateTenantIdP, TenantIdP } from "../tenants/identity/model";
import { table } from "../db/schema";
import { db } from "../db/db";


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

    static async getTokensFromAuthorizationCode(code: string): Promise<{ access_token: string, refresh_token: string, expires_in: number }>
    {
        const tokenResponse = await fetch(this.TOKEN_URL, {
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

        return (await tokenResponse.json());
    }

    static async createNonce(): Promise<string>
    {
        const [ nonce ] = await db.insert(table.authNonces).values({}).returning();

        return (nonce.nonce);
    }

    static async verifyNonce(nonce: string): Promise<boolean>
    {
        const result = await db.delete(table.authNonces).where(eq(table.authNonces.nonce, nonce)).returning();

        return (result.length > 0);
    }
}

export abstract class TenantIdPService extends OAuthService
{
    static async createTenantIdP(idpData: CreateTenantIdP): Promise<TenantIdP>
    {
        try {   
            const [ tenantIdP ] = await db.insert(table.tenantIdP).values(idpData).returning();
            
            return (tenantIdP);
        } catch (error) {
            console.error("Error creating tenantIdP:", error);

            throw new Error("Failed to create tenantIdP");
        }
    }
}
