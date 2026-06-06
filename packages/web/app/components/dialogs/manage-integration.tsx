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

import { useDeleteIntegration } from "@/hooks/use-integrations";

import type { Integration } from "@mkl-iam/back/src/tenants/integrations/model";
import { m } from "@/paraglide/messages";


type AppInfo = {
  name: string;
  description: string;
  type: string;
};

export function ManageIntegration({
  tenantId,
  integration,
  appInfo,
  openState,
}: {
  tenantId: string;
  integration: Integration;
  appInfo: AppInfo;
  openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
})
{
  const { trigger: deleteIntegration, isMutating } = useDeleteIntegration(tenantId);
  const [ open, setOpen ] = openState;

  const handleDisconnect = async () => {
    await deleteIntegration(integration.id);
    toast.success(m.integration_disconnect_success());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-muted rounded-lg shrink-0">
              <img src={`/icons/${ integration.app }.svg`} alt={`${ appInfo.name } logo`} width={28} height={28} />
            </div>
            <DialogTitle>{ m.manage_connection({ object: appInfo.name }) }</DialogTitle>
          </div>
          <DialogDescription>{ appInfo.description }</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              { m.integration_connected_since({ date: new Date(integration.createdAt).toLocaleDateString() }) }
            </p>
          </div>

          <div className="rounded-lg border border-destructive/30 px-4 py-3 space-y-3">
            <p className="text-sm font-medium">{ m.delete_connection({ object: appInfo.name }) }</p>
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
                m.integration_disconnect()
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
