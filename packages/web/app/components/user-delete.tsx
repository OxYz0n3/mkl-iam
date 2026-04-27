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

import { useDeleteUser } from "@/hooks/use-users";
import { toast } from "sonner";


export function DeleteUser({
  tenantId, userId, openState
}: {
  tenantId: string; userId: string; openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}) {
  const { trigger: deleteUser, isMutating: isDeletingUser } = useDeleteUser(tenantId);
  const [ open, setOpen ] = openState;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer un utilisateur</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={
            <Button variant="outline">Fermer</Button>
          } />
          <Button
            disabled={ isDeletingUser }
            onClick={ async () => {
              await deleteUser(userId);
              toast.success("Utilisateur supprimé avec succès !");
              setOpen(false);
            } }>
            { isDeletingUser ? <><Spinner /> Suppression en cours...</> : "Supprimer" }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
