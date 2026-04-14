import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { Employee } from "@mkl-iam/back/src/employees/model";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { app } from "~/lib/api";
import { getToken } from "~/lib/auth";
import { useOutletContext } from "react-router";
import type { MainContext } from "./main";

export default function Employees() {
  const [ employees, setEmployees ] = useState<Employee[]>([]);
  const [ isLoading, setIsLoading ] = useState(true);

  const { user, tenant } = useOutletContext<MainContext>();

  useEffect(() => {
    app.employees.get({ query: { tenantId: tenant.id }, headers: { Authorization: `Bearer ${getToken()}` } })
      .then(({ data, error }) => {
        if (!error) {
          setEmployees(data);
          return;
        }

        toast.error("Une erreur est survenue lors du chargement des employés");
      })
      .catch(() => {
        toast.error("Une erreur est survenue lors du chargement des employés");
      })
      .finally(() => setIsLoading(false));
  }, [ tenant ] );

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold">Gestion des employés</CardTitle>
          <Button
            onClick={() => toast.info("Le formulaire de création sera ajouté prochainement")}
          >
            <Plus className="size-4" />
            Créer un employé
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4 py-3 text-center font-medium">Nom</TableHead>
                  <TableHead className="px-4 py-3 text-center font-medium">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                      Chargement des employés...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="px-4 py-6 text-center text-muted-foreground">
                      Aucun employé trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="px-4 py-3 text-center">{`${employee.firstName} ${employee.lastName}`}</TableCell>
                      <TableCell className="px-4 py-3 text-center">{employee.email}</TableCell>
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
