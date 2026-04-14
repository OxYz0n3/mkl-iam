import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes"

export default [
    layout("routes/_protected.tsx", [
        index("routes/home.tsx"),
        route("add-tenant", "routes/add-tenant.tsx"),
    ]),
    ...prefix("auth", [
        route("login", "routes/login.tsx"),
        route("register", "routes/register.tsx")
    ]),
] satisfies RouteConfig
