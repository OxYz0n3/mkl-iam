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
import { m } from "@/paraglide/messages";


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
          <DialogTitle>{ m.user_delete_title() }</DialogTitle>
          <DialogDescription>
            { m.user_delete_confirmation() }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={
            <Button variant="outline">{ m.close() }</Button>
          } />
          <Button
            disabled={ isDeletingUser }
            onClick={ async () => {
              await deleteUser(userId);
              toast.success(m.user_delete_success());
              setOpen(false);
            } }>
            { isDeletingUser ? <><Spinner /> { m.deleting() }</> : m.delete() }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
