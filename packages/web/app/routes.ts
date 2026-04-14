import { type RouteConfig, index, route, prefix, layout } from "@react-router/dev/routes"

export default [
    layout("routes/_protected.tsx", [
        route("add-tenant", "routes/add-tenant.tsx"),
        layout("routes/main.tsx", [
            index("routes/dashboard.tsx"),
            route("employees", "routes/employees.tsx"),
        ])
    ]),
    ...prefix("auth", [
        route("login", "routes/login.tsx"),
        route("register", "routes/register.tsx")
    ]),
] satisfies RouteConfig
