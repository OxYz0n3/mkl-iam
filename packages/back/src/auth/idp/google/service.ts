import { IdPService } from "../service";


if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
    throw new Error("Google Client ID and Secret must be set in environment variables");


export class GoogleService extends IdPService
{
    protected static AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    protected static CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    protected static CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    protected static REDIRECT_URI = 'http://localhost:3000/auth/google/callback';
    protected static SCOPE = 'https://www.googleapis.com/auth/admin.directory.user';
    protected static OAUTH_URL = 'https://oauth2.googleapis.com/token';
}
