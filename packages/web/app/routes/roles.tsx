import { MoreHorizontalIcon, Plus, ShieldCheck } from "lucide-react";
import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteRole } from "@/components/role-delete";
import { UpsertRole } from "@/components/role-upsert";
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
import { useRoles } from "@/hooks/use-roles";

import type { Role } from "@mkl-iam/back/src/modules/tenants/roles/model";
import type { MainContext } from "./main";

import { m } from "@/paraglide/messages";


export default function Roles() {
  const { tenant } = useOutletContext<MainContext>();

  const { data: roles, isLoading } = useRoles(tenant.id);
  const { data: { availableIntegrations } } = useIntegrations(tenant.id);

  const [ updateRole, setUpdateRole ] = useState<Role | undefined>(undefined);
  const [ deleteRoleId, setDeleteRoleId ] = useState<string>("");
  const [ deleteOpen, setDeleteOpen ] = useState(false);
  const [ upsertOpen, setUpsertOpen ] = useState(false);

  useEffect(() => {
    if (!upsertOpen) setUpdateRole(undefined);
  }, [ upsertOpen ]);

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            { m.roles_management() }
          </CardTitle>
          <Button onClick={ () => setUpsertOpen(true) }>
            <Plus className="size-4" />
            { m.roles_add() }
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-3 py-2 font-medium">{ m.role_name() }</TableHead>
                  <TableHead className="px-3 py-2 font-medium">{ m.role_integrations() }</TableHead>
                  <TableHead className="px-3 py-2 font-medium text-right">{ m.actions() }</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-3 py-2 text-center text-muted-foreground">
                      { m.loading_roles() }
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-3 py-2 text-center text-muted-foreground">
                      { m.no_object_found({ object: m.role().toLocaleLowerCase() })}
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="px-3 py-2 font-medium">{role.name}</TableCell>
                      <TableCell className="px-3 py-2">
                        { role.integrations.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            { role.integrations.map((integration) => (
                              <div
                                key={integration.integrationId}
                                className="p-1 bg-muted rounded-md"
                                title={ availableIntegrations[integration.app]?.name || integration.app }
                              >
                                <img src={`/icons/${ integration.app }.svg`} alt={`${ integration.app } logo`} width={ 18 } height={ 18 } />
                              </div>
                            )) }
                          </div>
                        ) }
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontalIcon />
                            </Button>
                          } />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setUpdateRole(role);
                              setUpsertOpen(true);
                            }}>
                              { m.edit() }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeleteRoleId(role.id);
                                setDeleteOpen(true);
                              }}
                            >
                              { m.delete() }
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <UpsertRole tenant={ tenant } role={ updateRole } openState={[upsertOpen, setUpsertOpen]} />
          <DeleteRole
            tenantId={tenant.id}
            roleId={deleteRoleId}
            openState={[deleteOpen, setDeleteOpen]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
