import React, { useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDeleteEmployee } from "@/hooks/use-employees";
import { toast } from "sonner";


export function DeleteEmployee({
  tenantId, employeeId, openState
}: {
  tenantId: string; employeeId: string; openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}) {
  const { trigger: deleteEmployee, isMutating: isDeletingEmployee } = useDeleteEmployee(tenantId);
  const [ open, setOpen ] = openState;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer un employé</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={
            <Button variant="outline">Fermer</Button>
          } />
          <Button
            disabled={ isDeletingEmployee }
            onClick={ async () => {
              await deleteEmployee(employeeId);
              toast.success("Employé supprimé avec succès !");
              setOpen(false);
            } }>
            { isDeletingEmployee ? <><Spinner /> Suppression en cours...</> : "Supprimer" }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
