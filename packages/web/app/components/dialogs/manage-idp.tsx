import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

import { useDeleteIdentity } from "@/hooks/use-identity";

import type { TenantIdP } from "@mkl-iam/back/src/tenants/identity/model";
import { m } from "@/paraglide/messages";


type ProviderInfo = {
  name: string;
  description: string;
};

export function ManageIdp({
  tenantId,
  identity,
  providerInfo,
  onReconnect,
  openState,
}: {
  tenantId: string;
  identity: TenantIdP;
  providerInfo: ProviderInfo;
  onReconnect: () => void;
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
})
{
  const { trigger: deleteIdentity, isMutating } = useDeleteIdentity(tenantId);
  const [ open, setOpen ] = openState;

  const handleDisconnect = async () => {
    await deleteIdentity();
    toast.success(m.idp_disconnect_success());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-muted rounded-lg shrink-0">
              <img src={`/icons/${ identity.provider }.svg`} alt={`${ providerInfo.name } logo`} width={28} height={28} />
            </div>
            <DialogTitle>{ m.manage_connection({ object: providerInfo.name }) }</DialogTitle>
          </div>
          <DialogDescription>{ providerInfo.description }</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              { m.idp_connected_since({ date: new Date(identity.createdAt).toLocaleDateString() }) }
            </p>
          </div>

          <Button variant="outline" className="w-full" onClick={ onReconnect } disabled={ isMutating }>
            <RefreshCw className="size-4" />
            { m.reconnect_object({ object: providerInfo.name }) }
          </Button>

          <div className="rounded-lg border border-destructive/30 px-4 py-3 space-y-3">
            <p className="text-sm font-medium">{ m.delete_connection({ object: providerInfo.name }) }</p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={ handleDisconnect }
              disabled={ isMutating }
            >
              { isMutating ? (
                <>
                  <Spinner />
                  { m.deleting() }
                </>
              ) : (
                m.idp_disconnect()
              ) }
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={
            <Button variant="outline" className="w-full">
              { m.close() }
            </Button>
          } />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
