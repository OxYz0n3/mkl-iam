import validator from "validator";
import { useState } from "react";

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
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAddEmployee } from "@/hooks/use-employees";
import { toast } from "sonner";


export function AddEmployee({ tenantId, trigger }: { tenantId: string; trigger: React.ReactElement })
{
  const { trigger: addEmployee, isMutating: isAddingEmployee } = useAddEmployee(tenantId);

  const [ firstName, setFirstName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ open, setOpen ] = useState(false);

  const isValid = firstName.trim() !== "" && lastName.trim() !== "" && validator.isEmail(email);

  const handleEmployeeSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addEmployee({ firstName, lastName, email });

    toast.success("Employé ajouté avec succès !");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={ handleEmployeeSubmit } className="space-y-6">
          <DialogHeader>
            <DialogTitle>Ajouter un employé</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour ajouter un nouvel employé à votre entreprise.
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
              <Label>Email de l'employé</Label>
              <Input
                required
                type="email"
                value={email}
                aria-invalid={ email && !validator.isEmail(email) ? "true" : "false" }
                placeholder="michel.dupont@exemple.com"
                onChange={(e) => setEmail(e.target.value)} />
              <FieldDescription>L'employé recevra une invitation par email pour créer son compte.</FieldDescription>
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
            <Button type="submit" disabled={ !isValid || isAddingEmployee }>
              { isAddingEmployee ? <><Spinner /> Ajout en cours...</> : "Ajouter" }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
