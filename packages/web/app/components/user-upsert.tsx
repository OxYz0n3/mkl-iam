import validator from "validator";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAddUser } from "@/hooks/use-users";

import type { TenantUser } from "@mkl-iam/back/src/tenants/users/model";
import type { Tenant } from "@mkl-iam/back/src/tenants/model";


export function UpsertUser({ tenant, user, openState }: { tenant: Tenant; user?: TenantUser; openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>] })
{
  const { trigger: addUser, isMutating: isAddingUser } = useAddUser(tenant.id);

  const [ secondaryEmail, setSecondaryEmail ] = useState("");
  const [ primaryEmail, setPrimaryEmail ] = useState("");
  const [ firstName, setFirstName ] = useState("");
  const [ lastName, setLastName ] = useState("");

  const [ open, setOpen ] = openState;

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPrimaryEmail(user?.primaryEmail.replace(`@${tenant.domain}`, "") || "");
    setSecondaryEmail(user?.secondaryEmail || "");
  }, [ user ]);

  const isValid = firstName.trim() !== "" && lastName.trim() !== "" && validator.isEmail(`${primaryEmail}@${tenant.domain}`);

  const handleUserSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addUser({
      firstName,
      lastName,
      primaryEmail: `${primaryEmail}@${tenant.domain}`,
      secondaryEmail: (secondaryEmail.trim() !== "" ? secondaryEmail : undefined),
    });

    toast.success("Utilisateur ajouté avec succès !");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={ handleUserSubmit } className="space-y-6">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour ajouter un nouvel utilisateur à votre entreprise.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label>Prénom</Label>
                <Input required placeholder="Michel" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Field>
              <Field>
                <Label>Nom</Label>
                <Input required placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Field>
            </div>
            <Field>
              <Label>Email principale de l'utilisateur</Label>
              <InputGroup>
                <InputGroupInput
                  required
                  value={primaryEmail}
                  aria-invalid={ primaryEmail && !validator.isEmail(`${primaryEmail}@${tenant.domain}`) ? "true" : "false" }
                  placeholder="michel.dupont"
                  onChange={(e) => setPrimaryEmail(e.target.value)} />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>@{tenant.domain}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <Label>Email secondaire de l'utilisateur</Label>
              <Input
                type="email"
                value={secondaryEmail}
                aria-invalid={ secondaryEmail && !validator.isEmail(secondaryEmail) ? "true" : "false" }
                placeholder="michel.dupont@example.com"
                onChange={(e) => setSecondaryEmail(e.target.value)} />
              <FieldDescription>Les instructions de connexion sont envoyées à l'adresse e-mail secondaire.</FieldDescription>
            </Field>
            <Field>
              <Label>Rôle</Label>
              <Input disabled placeholder="Cette fonctionnalité est en cours de développement" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={
              <Button variant="outline">Fermer</Button>
            } />
            <Button type="submit" disabled={ !isValid || isAddingUser }>
              { isAddingUser ? <><Spinner /> Ajout en cours...</> : "Ajouter" }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
