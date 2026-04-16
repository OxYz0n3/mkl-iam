import { MoreHorizontalIcon, Plus } from "lucide-react";
import { useOutletContext } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteEmployee } from "@/components/employee-delete";
import { AddEmployee } from "@/components/employee-add";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEmployees } from "@/hooks/use-employees";

import type { MainContext } from "./main";


export default function Employees() {
  const { tenant } = useOutletContext<MainContext>();
  const { data: employees, isLoading } = useEmployees(tenant.id);
  const [ deleteEmployeeId, setDeleteEmployeeId ] = useState<string>("");
  const [ deleteOpen, setDeleteOpen ] = useState(false);

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold">Gestion des employés</CardTitle>
          <AddEmployee tenantId={ tenant.id } trigger={
            <Button>
              <Plus className="size-4" />
              Ajouter un employé
            </Button>
          }/>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4 py-3 font-medium">Nom</TableHead>
                  <TableHead className="px-4 py-3 font-medium">Email</TableHead>
                  <TableHead className="px-4 py-3 font-medium">Rôle</TableHead>
                  <TableHead className="px-4 py-3 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      Chargement des employés...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      Aucun employé trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="px-4 py-3">{`${employee.firstName} ${employee.lastName}`}</TableCell>
                      <TableCell className="px-4 py-3">{employee.email}</TableCell>
                      <TableCell className="px-4 py-3">{employee.role}</TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontalIcon />
                            </Button>
                          } />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast("Modifier l'employé")}>
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeleteEmployeeId(employee.id);
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
          <DeleteEmployee
            tenantId={tenant.id}
            employeeId={deleteEmployeeId}
            openState={[deleteOpen, setDeleteOpen]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
