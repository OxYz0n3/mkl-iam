import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes"

export default [
    layout("routes/_protected.tsx", [
        route("account", "routes/account.tsx"),
        route("add-tenant", "routes/add-tenant.tsx"),
        layout("routes/main.tsx", [
            index("routes/dashboard.tsx"),
            route("users", "routes/users.tsx"),
            route("integrations", "routes/integrations.tsx"),
            route("settings", "routes/settings.tsx"),
        ])
    ]),
    ...prefix("auth", [
        route("login", "routes/login.tsx"),
        route("register", "routes/register.tsx")
    ]),
] satisfies RouteConfig
