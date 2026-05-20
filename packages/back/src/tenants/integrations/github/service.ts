import { TenantIntegrationService } from "../service";


if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET)
    throw new Error("GitHub Client ID and Secret must be set in environment variables");


export class GitHubService extends TenantIntegrationService {
    protected static AUTH_URL = 'https://github.com/oauth/authorize';
    protected static CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
    protected static CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
    protected static REDIRECT_URI = 'http://localhost:3000/integrations/github/callback';
    protected static SCOPE = 'admin_mode';
    protected static TOKEN_URL = 'https://github.com/oauth/token';
}
