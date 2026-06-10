import React from "react";
import { toast } from "sonner";

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

import { useDeleteRole } from "@/hooks/use-roles";
import { m } from "@/paraglide/messages";


export function DeleteRole({
  tenantId, roleId, openState
}: {
  tenantId: string; roleId: string; openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}) {
  const { trigger: deleteRole, isMutating: isDeletingRole } = useDeleteRole(tenantId);
  const [ open, setOpen ] = openState;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{ m.role_delete_title() }</DialogTitle>
          <DialogDescription>
            { m.role_delete_confirmation() }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={
            <Button variant="outline">{ m.close() }</Button>
          } />
          <Button
            disabled={ isDeletingRole }
            onClick={ async () => {
              await deleteRole(roleId);
              toast.success(m.role_delete_success());
              setOpen(false);
            } }>
            { isDeletingRole ? <><Spinner /> { m.deleting() }</> : m.delete() }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
