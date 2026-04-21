import { TenantIntegrationService } from "../service";


if (!process.env.GITLAB_CLIENT_ID || !process.env.GITLAB_CLIENT_SECRET)
    throw new Error("GitLab Client ID and Secret must be set in environment variables");


export class GitlabCloudService extends TenantIntegrationService {
    protected static AUTH_URL = 'https://gitlab.com/oauth/authorize';
    protected static CLIENT_ID = process.env.GITLAB_CLIENT_ID;
    protected static CLIENT_SECRET = process.env.GITLAB_CLIENT_SECRET;
    protected static REDIRECT_URI = 'http://localhost:3000/integrations/gitlab-cloud/callback';
    protected static SCOPE = 'admin_mode';
    protected static TOKEN_URL = 'https://gitlab.com/oauth/token';
}
