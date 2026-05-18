import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";

import { useDeleteTenant } from "@/hooks/use-tenants";

import type { Tenant } from "@mkl-iam/back/src/tenants/model";
import { Spinner } from "../ui/spinner";
import { useState } from "react";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";


export default function DeleteTenant({ tenant }: { tenant: Tenant })
{
  const { trigger: deleteTenant, isMutating } = useDeleteTenant(tenant.id);
  const [ tenantName, setTenantName ] = useState('');

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button
          disabled={tenant.role != 'owner'}
          variant="destructive">
          Supprimer l'entreprise
        </Button>
      } />
      <AlertDialogContent>
        <AlertDialogHeader className="gap-4">
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir supprimer l'entreprise?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible!
            <br />
            Pour confirmer, écrivez "<b>{ tenant.name }</b>" dans le champ ci-dessous.
          </AlertDialogDescription>
          <Field>
            <Label>Nom de l'entreprise</Label>
            <Input required placeholder={ tenant.name } value={ tenantName } onChange={(e) => setTenantName(e.target.value)} />
          </Field>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => deleteTenant()}
            disabled={isMutating || tenantName != tenant.name}
          >
            { isMutating &&
              <Spinner/>
            }
            Supprimer l'entreprise
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}