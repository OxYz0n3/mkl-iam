import { MoreHorizontalIcon, Plus, RefreshCw } from "lucide-react";
import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteUser } from "@/components/user-delete";
import { UpsertUser } from "@/components/user-upsert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useUsers, useSyncUsers } from "@/hooks/use-users";

import type { MainContext } from "./main";
import type { TenantUser } from "@mkl-iam/back/src/tenants/users/model";


export default function Users() {
  const { tenant } = useOutletContext<MainContext>();

  const { trigger: syncUsers, isMutating: isSyncingUsers } = useSyncUsers(tenant.id);
  const [ updateUser, setUpdateUser ] = useState<TenantUser | undefined>(undefined);
  const [ deleteUserId, setDeleteUserId ] = useState<string>("");
  const { data: users, isLoading } = useUsers(tenant.id);
  const [ deleteOpen, setDeleteOpen ] = useState(false);
  const [ upsertOpen, setUpsertOpen ] = useState(false);

  useEffect(() => {
    if (!upsertOpen) setUpdateUser(undefined);
  }, [ upsertOpen ]);

  const handleSyncUsers = async () => {
    const addedUsers = await syncUsers();

    if (addedUsers.length > 0)
      toast.success(`${ addedUsers.length } utilisateur(s) synchronisé(s) avec succès !`);
    else
      toast.info("Pas d'utilisateurs à synchroniser.");
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl font-bold">Gestion des utilisateurs</CardTitle>
          <div className="flex gap-4">
            <Button variant="outline" onClick={ () => handleSyncUsers() } disabled={ isSyncingUsers }>
              <RefreshCw className="size-4" />
              Synchroniser les utilisateurs
            </Button>
            <Button onClick={ () => setUpsertOpen(true) }>
              <Plus className="size-4" />
              Ajouter un utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-3 py-2 font-medium">Nom</TableHead>
                  <TableHead className="px-3 py-2 font-medium">Email principal</TableHead>
                  <TableHead className="px-3 py-2 font-medium">Rôle</TableHead>
                  <TableHead className="px-3 py-2 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-3 py-2 text-center text-muted-foreground">
                      Chargement des utilisateurs...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-3 py-2 text-center text-muted-foreground">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-3 py-2">{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell className="px-3 py-2">{user.primaryEmail}</TableCell>
                      <TableCell className="px-3 py-2">{user.role}</TableCell>
                      <TableCell className="px-3 py-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontalIcon />
                            </Button>
                          } />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setUpdateUser(user);
                              setUpsertOpen(true);
                            }}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeleteUserId(user.id);
                                setDeleteOpen(true);
                              }}
                            >
                              Supprimer
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
          <UpsertUser tenant={ tenant } user={ updateUser } openState={[upsertOpen, setUpsertOpen]} />
          <DeleteUser
            tenantId={tenant.id}
            userId={deleteUserId}
            openState={[deleteOpen, setDeleteOpen]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
