import { OAuthService } from "../oauth";


if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET)
    throw new Error("Microsoft Client ID and Secret must be set in environment variables");
if (!process.env.BACKEND_URL)
    throw new Error("BACKEND_URL must be set in environment variables");


export abstract class MicrosoftService extends OAuthService
{
    protected static AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    protected static CLIENT_ID = process.env.MICROSOFT_CLIENT_ID!;
    protected static CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET!;
    protected static REDIRECT_URI = `${ process.env.BACKEND_URL }/identity/microsoft/callback`;
    protected static SCOPE = 'User.Read.All Directory.Read.All';
    protected static TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
}
