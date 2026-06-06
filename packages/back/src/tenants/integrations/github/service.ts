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
    protected static SCOPE_CHECK = false;

    static async getOrganizationMembers(tenantId: string, orgName: string): Promise<GitHubOrganizationMember[]>
    {
        const accessToken = await this.getAccessToken(tenantId);
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github+json',
        };

        // Fetch all members (paginated)
        const members: Array<{ login: string }> = [];
        let url: string | null = `https://api.github.com/orgs/${orgName}/members?per_page=100`;

        while (url)
        {
            const response = await fetch(url, { headers });

            if (!response.ok)
                throw new Error(`Failed to fetch organization members: ${await response.text()}`);

            const page = await response.json();
            members.push(...page);

            // Parse Link header for next page
            const linkHeader = response.headers.get('Link');
            url = linkHeader ? this.parseNextPageUrl(linkHeader) : null;
        }

        // Enrich each member with name, email, and membership status
        const enriched = await Promise.all(members.map(async (member) => {
            const [userResponse, membershipResponse] = await Promise.all([
                fetch(`https://api.github.com/users/${member.login}`, { headers }),
                fetch(`https://api.github.com/orgs/${orgName}/memberships/${member.login}`, { headers }),
            ]);

            const user: Record<string, unknown> | null = userResponse.ok ? await userResponse.json() as Record<string, unknown> : null;
            const membership: Record<string, unknown> | null = membershipResponse.ok ? await membershipResponse.json() as Record<string, unknown> : null;

            return ({
                name: (user?.name as string) || member.login,
                email: (user?.email as string) || null,
                status: (membership?.state as string) || 'active',
            });
        }));

        return (enriched);
    }

    private static parseNextPageUrl(linkHeader: string): string | null
    {
        const links = linkHeader.split(',');

        for (const link of links)
        {
            const [ urlPart, relPart ] = link.split(';');

            if (relPart?.includes('rel="next"'))
                return (urlPart.trim().slice(1, -1));  // Remove < and >
        }

        return (null);
    }
}

export interface GitHubOrganizationMember
{
    name: string;
    email: string | null;
    status: string;
}
