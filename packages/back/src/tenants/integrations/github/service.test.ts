import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { GitHubService, type GitHubOrganizationMember } from "./service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a mock GitHub member object (what GET /orgs/{org}/members returns). */
function ghMember(login: string) {
    return ({
        login,
        id: Math.floor(Math.random() * 100000),
        avatar_url: `https://avatars.githubusercontent.com/u/${login}`,
        type: "User",
    });
}

/** Build a mock GitHub user profile (what GET /users/{username} returns). */
function ghUser(overrides: Partial<{ name: string; email: string | null; login: string }> = {}) {
    return ({
        login: overrides.login ?? "testuser",
        name: overrides.name ?? null,
        email: overrides.email ?? null,
        id: 123,
        avatar_url: "",
    });
}

/** Build a mock GitHub membership (what GET /orgs/{org}/memberships/{username} returns). */
function ghMembership(state: string = "active", role: string = "member") {
    return ({ state, role, user: ghUser() });
}

/**
 * Stub `GitHubService.getAccessToken` and `globalThis.fetch` for a suite of
 * tests.  Returns the mock fetch so assertions can be made on call counts.
 */
function stubService(members: Array<{ login: string }>, users: Record<string, Record<string, unknown>>, memberships: Record<string, Record<string, unknown>>) {
    // Stub getAccessToken once
    spyOn(GitHubService as any, "getAccessToken").mockResolvedValue("fake-token");

    // Stub fetch
    const fetchMock = mock((input: string | URL | Request): Response => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

        // GET /orgs/{org}/members
        if (url.includes("/members") && !url.includes("/memberships/")) {
            return new Response(JSON.stringify(members), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // GET /users/{username}  (extract login from path)
        const userMatch = url.match(/\/users\/([^/]+)/);
        if (userMatch) {
            const login = userMatch[1];
            const user = users[login] ?? { login, name: null, email: null };
            return new Response(JSON.stringify(user), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // GET /orgs/{org}/memberships/{username}
        const membershipMatch = url.match(/\/memberships\/([^/]+)/);
        if (membershipMatch) {
            const login = membershipMatch[1];
            const membership = memberships[login] ?? { state: "active", role: "member" };
            return new Response(JSON.stringify(membership), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response("Not Found", { status: 404 });
    });

    (globalThis as any).fetch = fetchMock;
    return fetchMock;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GitHubService.getOrganizationMembers", () => {
    afterEach(() => {
        mock.restore();
    });

    // -- Basic ---------------------------------------------------------------

    it("returns a list of members with name, email, and status", async () => {
        const members = [ghMember("alice"), ghMember("bob")];
        const users: Record<string, Record<string, unknown>> = {
            alice: { name: "Alice Wonderland", email: "alice@example.com", login: "alice" },
            bob: { name: "Bob Builder", email: "bob@example.com", login: "bob" },
        };
        const memberships: Record<string, Record<string, unknown>> = {
            alice: { state: "active", role: "admin" },
            bob: { state: "active", role: "member" },
        };

        stubService(members, users, memberships);

        const result: GitHubOrganizationMember[] = await (GitHubService as any).getOrganizationMembers("tenant-1", "my-org");

        expect(result).toBeArray();
        expect(result.length).toBe(2);
        expect(result[0]).toEqual({ name: "Alice Wonderland", email: "alice@example.com", status: "active" });
        expect(result[1]).toEqual({ name: "Bob Builder", email: "bob@example.com", status: "active" });
    });

    // -- Fallbacks -----------------------------------------------------------

    it("falls back to login when user has no name", async () => {
        const members = [ghMember("ghost")];
        const users: Record<string, Record<string, unknown>> = {
            ghost: { name: null, email: null, login: "ghost" },
        };

        stubService(members, users, {});

        const result: GitHubOrganizationMember[] = await (GitHubService as any).getOrganizationMembers("t", "org");

        expect(result[0].name).toBe("ghost");
    });

    it("returns null for email when user has no public email", async () => {
        const members = [ghMember("private")];
        const users: Record<string, Record<string, unknown>> = {
            private: { name: "Private Person", email: null, login: "private" },
        };

        stubService(members, users, {});

        const result: GitHubOrganizationMember[] = await (GitHubService as any).getOrganizationMembers("t", "org");

        expect(result[0].email).toBeNull();
    });

    it("defaults status to 'active' when membership is not found", async () => {
        const members = [ghMember("newbie")];
        const users: Record<string, Record<string, unknown>> = {
            newbie: { name: "New User", email: "newbie@example.com", login: "newbie" },
        };

        // No membership entry → should default to "active"
        stubService(members, users, {});

        const result: GitHubOrganizationMember[] = await (GitHubService as any).getOrganizationMembers("t", "org");

        expect(result[0].status).toBe("active");
    });

    // -- Pagination ----------------------------------------------------------

    it("handles paginated results (multiple pages)", async () => {
        // Page 1: 2 members, Page 2: 1 member
        const page1 = [ghMember("alice"), ghMember("bob")];
        const page2 = [ghMember("charlie")];

        spyOn(GitHubService as any, "getAccessToken").mockResolvedValue("fake-token");

        let callCount = 0;
        const paginatedFetch = mock((input: string | URL | Request): Response => {
            const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

            if (url.includes("/members") && !url.includes("/memberships/")) {
                callCount++;
                if (callCount === 1) {
                    // First page — include Link header for next page
                    return new Response(JSON.stringify(page1), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                            Link: '<https://api.github.com/orgs/my-org/members?page=2>; rel="next"',
                        },
                    });
                }
                // Second page — no Link header
                return new Response(JSON.stringify(page2), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // User detail responses
            const users: Record<string, Record<string, unknown>> = {
                alice: { name: "Alice", email: "alice@e.com", login: "alice" },
                bob: { name: "Bob", email: "bob@e.com", login: "bob" },
                charlie: { name: "Charlie", email: "charlie@e.com", login: "charlie" },
            };
            const userMatch = url.match(/\/users\/([^/]+)/);
            if (userMatch) return new Response(JSON.stringify(users[userMatch[1]]), { status: 200, headers: { "Content-Type": "application/json" } });

            // Membership responses
            const membershipMatch = url.match(/\/memberships\/([^/]+)/);
            if (membershipMatch) return new Response(JSON.stringify({ state: "active" }), { status: 200, headers: { "Content-Type": "application/json" } });

            return new Response("Not Found", { status: 404 });
        });

        (globalThis as any).fetch = paginatedFetch;

        const result: GitHubOrganizationMember[] = await (GitHubService as any).getOrganizationMembers("t", "my-org");

        expect(result.length).toBe(3);
        expect(result[0].name).toBe("Alice");
        expect(result[1].name).toBe("Bob");
        expect(result[2].name).toBe("Charlie");
        expect(callCount).toBe(2);
    });

    // -- Error ---------------------------------------------------------------

    it("throws when the members API returns a non-ok status", async () => {
        spyOn(GitHubService as any, "getAccessToken").mockResolvedValue("fake-token");
        (globalThis as any).fetch = mock((): Response => {
            return new Response("Rate limited", { status: 429 });
        });

        await expect(
            (GitHubService as any).getOrganizationMembers("t", "org")
        ).rejects.toThrow("Failed to fetch organization members");
    });

    // -- Empty org -----------------------------------------------------------

    it("returns an empty array when the organization has no members", async () => {
        stubService([], {}, {});

        const result: GitHubOrganizationMember[] = await (GitHubService as any).getOrganizationMembers("t", "org");

        expect(result).toBeArray();
        expect(result.length).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// parseNextPageUrl (private, tested via the public API above, but also edge cases)
// ---------------------------------------------------------------------------

describe("GitHubService.parseNextPageUrl", () => {
    afterEach(() => {
        mock.restore();
    });

    const parse = (header: string) =>
        (GitHubService as any).parseNextPageUrl(header);

    it("returns the next URL when rel='next' is present", () => {
        const header = '<https://api.github.com/orgs/my-org/members?page=2>; rel="next"';
        expect(parse(header)).toBe("https://api.github.com/orgs/my-org/members?page=2");
    });

    it("returns null when there is no next link", () => {
        const header = '<https://api.github.com/orgs/my-org/members?page=1>; rel="prev"';
        expect(parse(header)).toBeNull();
    });

    it("handles multiple links (next among others)", () => {
        const header =
            '<https://api.github.com/orgs/my-org/members?page=1>; rel="prev", ' +
            '<https://api.github.com/orgs/my-org/members?page=3>; rel="next", ' +
            '<https://api.github.com/orgs/my-org/members?page=5>; rel="last"';
        expect(parse(header)).toBe("https://api.github.com/orgs/my-org/members?page=3");
    });

    it("handles next as first link", () => {
        const header =
            '<https://api.github.com/orgs/my-org/members?page=2>; rel="next", ' +
            '<https://api.github.com/orgs/my-org/members?page=1>; rel="prev"';
        expect(parse(header)).toBe("https://api.github.com/orgs/my-org/members?page=2");
    });
});