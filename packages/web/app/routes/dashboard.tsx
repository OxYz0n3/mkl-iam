import { AlertTriangle, CheckCircle2, Plug, Settings, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useIntegrations } from "@/hooks/use-integrations";
import { useUsers } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";

import { localizeHref } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";

import type { MainContext } from "./main";


export default function Dashboard()
{
  const { tenant } = useOutletContext<MainContext>();
  const navigate = useNavigate();

  const { data: integrations } = useIntegrations(tenant.id);
  const { data: users, isLoading } = useUsers(tenant.id);
  const { data: roles } = useRoles(tenant.id);

  const recentUsers = [ ...users ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      name: m.users(),
      icon: UsersIcon,
      value: users.length,
      href: "/users",
    }, {
      name: m.roles(),
      icon: ShieldCheck,
      value: roles.length,
      href: "/roles",
    }, {
      name: m.integrations(),
      icon: Plug,
      value: integrations.addedIntegrations.length,
      href: "/integrations",
    }
  ];

  const quickActions = [
    { name: m.users(), icon: UsersIcon, href: "/users" },
    { name: m.roles(), icon: ShieldCheck, href: "/roles" },
    { name: m.integrations(), icon: Plug, href: "/integrations" },
    { name: m.settings(), icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">{ m.dashboard_welcome() }</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        { stats.map((stat) => (
          <Card
            key={ stat.href }
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={ () => navigate(localizeHref(stat.href)) }
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{ stat.name }</CardTitle>
              <stat.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{ stat.value }</span>
            </CardContent>
          </Card>
        ))}
        <Card
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={ () => navigate(localizeHref("/settings")) }
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{ m.dashboard_idp_status() }</CardTitle>
            { tenant.isIdPSynced ?
              <CheckCircle2 className="size-4 text-green-500" />
              :
              <AlertTriangle className="size-4 text-orange-400" />
            }
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              { tenant.isIdPSynced ? m.connected() : m.not_connected() }
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{ m.dashboard_quick_actions() }</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          { quickActions.map((action) => (
            <Button key={ action.href } variant="outline" onClick={ () => navigate(localizeHref(action.href)) }>
              <action.icon className="size-4" />
              { action.name }
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            { m.dashboard_recent_users() }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-3 py-2 font-medium">{ m.name() }</TableHead>
                  <TableHead className="px-3 py-2 font-medium">{ m.primary_email() }</TableHead>
                  <TableHead className="px-3 py-2 font-medium">{ m.role() }</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-3 py-2 text-center text-muted-foreground">
                      { m.loading_users() }
                    </TableCell>
                  </TableRow>
                ) : recentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-3 py-2 text-center text-muted-foreground">
                      { m.no_object_found({ object: m.user().toLocaleLowerCase() })}
                    </TableCell>
                  </TableRow>
                ) : (
                  recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-3 py-2">{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell className="px-3 py-2">{user.primaryEmail}</TableCell>
                      <TableCell className="px-3 py-2">{ roles.find((role) => role.id === user.roleId)?.name || '-' }</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
