import { OAuthService } from "../../utils/oauth_service";
import { AddUser } from "../users/model";
import { ProviderKey } from "./model";


if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
    throw new Error("Google Client ID and Secret must be set in environment variables");
if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET)
    throw new Error("Microsoft Client ID and Secret must be set in environment variables");


export abstract class GoogleService extends OAuthService
{
    protected static AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    protected static CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
    protected static CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
    protected static REDIRECT_URI = 'http://localhost:3000/identity/google/callback';
    protected static SCOPE = 'https://www.googleapis.com/auth/admin.directory.user';
    protected static TOKEN_URL = 'https://oauth2.googleapis.com/token';

    static async getUsers(tenantId: string, accessToken: string): Promise<AddUser[]>
    {
        const response = await fetch('https://admin.googleapis.com/admin/directory/v1/users?customer=my_customer', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ accessToken }`,
            }
        });

        if (!response.ok)
            throw new Error(`Failed to fetch users from Google: ${ await response.text() }`);

        const data = await response.json();

        return (data.users.map((user: any): AddUser => ({
            primaryEmail: user.primaryEmail,
            secondaryEmail: user.emails?.find((email: any) => email.type === 'custom')?.address,
            firstName: user.name.givenName || '',
            lastName: user.name.familyName || '',
        })));
    }

    static async createUser(tenantId: string, newUser: AddUser): Promise<AddUser>
    {
        const response = await fetch('https://admin.googleapis.com/admin/directory/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ await this.getAccessToken(tenantId) }`,
            },
            body: JSON.stringify({
                primaryEmail: newUser.primaryEmail,
                secondaryEmail: newUser.secondaryEmail,
                name: {
                    givenName: newUser.firstName,
                    familyName: newUser.lastName,
                    fullName: `${ newUser.firstName } ${ newUser.lastName }`,
                },
                password: Math.random().toString(36).slice(-8) + 'Aa1!',  // Generate a random password that meets complexity requirements
            }),
        });

        if (!response.ok)
            throw new Error(`Failed to create user in Google: ${ await response.text() }`);

        const data = await response.json();

        return ({
            primaryEmail: data.primaryEmail,
            firstName: data.name.givenName,
            lastName: data.name.familyName,
            secondaryEmail: data.secondaryEmail || '',
        }) as AddUser;
    }
}

export abstract class MicrosoftService extends OAuthService
{
    protected static AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    protected static CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
    protected static CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
    protected static REDIRECT_URI = 'http://localhost:3000/identity/microsoft/callback';
    protected static SCOPE = 'User.Read.All Directory.Read.All';
    protected static TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
}


export const providersServiceMap: Record<ProviderKey, typeof OAuthService> = {
    google: GoogleService,
    microsoft: MicrosoftService,
} as const;