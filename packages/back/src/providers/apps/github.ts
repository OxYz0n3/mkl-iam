import { createSign } from "node:crypto";
import { redis } from "bun";

import { TenantIntegrationService } from "./base";


if (!process.env.GITHUB_APP_SLUG || !process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY)
    throw new Error("GitHub App credentials (GITHUB_APP_SLUG, GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY) must be set in environment variables");


export class GitHubService extends TenantIntegrationService
{
    private static APP_SLUG = process.env.GITHUB_APP_SLUG!;
    private static APP_ID = process.env.GITHUB_APP_ID!;
    private static PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n');

    /**
     * For the shared GitHub App (install) model, "connecting" means sending the
     * org owner to GitHub's installation page. The signed `state` is carried
     * through and handed back to the setup callback once the app is installed.
     */
    static getAuthUrl(state: string): string
    {
        return (`https://github.com/apps/${ this.APP_SLUG }/installations/new?state=${ encodeURIComponent(state) }`);
    }

    static async isConfigValid(config: any): Promise<boolean>
    {
        if (config === null || config === undefined)
            return (true);

        if (typeof config !== 'object' || Array.isArray(config))
            return (false);

        const { projects } = config as { projects?: unknown };

        return (projects === undefined
            || (Array.isArray(projects) && projects.every((project) => typeof project === 'string')));
    }

    static async getResources(metadata: any): Promise<any>
    {
        return (await this.listRepositories(metadata.installationId));
    }

    static async listRepositories(installationId: number): Promise<{ id: string; name: string }[]>
    {
        const token = await this.getInstallationToken(installationId);
        const repositories: { id: string; name: string }[] = [];

        for (let page = 1; ; page++) {
            const response = await fetch(`https://api.github.com/installation/repositories?per_page=100&page=${ page }`, {
                headers: {
                    'Authorization': `Bearer ${ token }`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            if (!response.ok)
                throw new Error(`Failed to list repositories: ${ await response.text() }`);

            const data = await response.json();

            for (const repository of data.repositories)
                repositories.push({ id: repository.full_name, name: repository.full_name });

            if (data.repositories.length < 100)
                break;
        }

        return (repositories);
    }

    private static async getInstallationToken(installationId: number): Promise<string>
    {
        const cacheKey = `github_installation_token:${ installationId }`;
        const cached = await redis.get(cacheKey);

        if (cached)
            return (cached);

        const response = await fetch(`https://api.github.com/app/installations/${ installationId }/access_tokens`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ this.getAppJwt() }`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });

        if (!response.ok)
            throw new Error(`Failed to get installation token: ${ await response.text() }`);

        const data = await response.json();

        await redis.set(cacheKey, data.token, 'EX', 3300);  // Installation tokens expire after 1 hour

        return (data.token);
    }

    private static getAppJwt(): string
    {
        const now = Math.floor(Date.now() / 1000);
        const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
        const payload = Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: this.APP_ID })).toString('base64url');
        const data = `${ header }.${ payload }`;
        const signature = createSign('RSA-SHA256').update(data).sign(this.PRIVATE_KEY).toString('base64url');

        return (`${ data }.${ signature }`);
    }
}
