import { useEffect, useState } from "react";
import validator from "validator";
import { toast } from "sonner";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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

import type { TenantUser } from "@mkl-iam/back/src/modules/tenants/users/model";
import type { Role } from "@mkl-iam/back/src/modules/tenants/roles/model";
import type { Tenant } from "@mkl-iam/back/src/modules/tenants/model";

import { m } from "@/paraglide/messages";


export function UpsertUser({ tenant, user, roles, openState }: { tenant: Tenant; user?: TenantUser; roles: Role[]; openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>] })
{
  const { trigger: addUser, isMutating: isAddingUser } = useAddUser(tenant.id);

  const [ secondaryEmail, setSecondaryEmail ] = useState("");
  const [ primaryEmail, setPrimaryEmail ] = useState("");
  const [ firstName, setFirstName ] = useState("");
  const [ lastName, setLastName ] = useState("");
  const [ roleId, setRoleId ] = useState<string | null>(null);

  const [ open, setOpen ] = openState;

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPrimaryEmail(user?.primaryEmail.replace(`@${tenant.domain}`, "") || "");
    setSecondaryEmail(user?.secondaryEmail || "");
    setRoleId(user?.roleId ?? null);
  }, [ user ]);

  const isValid = firstName.trim() !== "" && lastName.trim() !== "" && validator.isEmail(`${primaryEmail}@${tenant.domain}`) && roleId !== null;

  const handleUserSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addUser({
      firstName,
      lastName,
      primaryEmail: `${primaryEmail}@${tenant.domain}`,
      secondaryEmail: (secondaryEmail.trim() !== "" ? secondaryEmail : undefined),
      roleId: roleId,
    });

    toast.success(m.user_add_success());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={ handleUserSubmit } className="space-y-6">
          <DialogHeader>
            <DialogTitle>
              {
                user ? m.users_edit() : m.users_add()
              }
            </DialogTitle>
            <DialogDescription>
              { m.user_upsert_description() }
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <Label>
                  { m.first_name() }
                </Label>
                <Input required placeholder={m.first_name_placeholder()} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Field>
              <Field>
                <Label>
                  { m.last_name() }
                </Label>
                <Input required placeholder={m.last_name_placeholder()} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Field>
            </div>
            <Field>
              <Label>{ m.user_primary_email() }</Label>
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
              <Label>{ m.user_secondary_email() }</Label>
              <Input
                type="email"
                value={secondaryEmail}
                aria-invalid={ secondaryEmail && !validator.isEmail(secondaryEmail) ? "true" : "false" }
                placeholder="michel.dupont@example.com"
                onChange={(e) => setSecondaryEmail(e.target.value)} />
              <FieldDescription>{ m.user_secondary_email_description() }</FieldDescription>
            </Field>
            <Field>
              <Label>{ m.role() }</Label>
              <Select value={ roleId } onValueChange={ setRoleId } items={ roles.map((role) => ({ label: role.name, value: role.id })) } disabled={ roles.length === 0 }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    { roles.map(role => (
                      <SelectItem value={ role.id } key={ role.id }>{ role.name }</SelectItem>
                    )) }
                  </SelectGroup>
                </SelectContent>
              </Select>
              { roles.length === 0 && <FieldDescription>{ m.role_no_options() }</FieldDescription> }
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={
              <Button variant="outline">
                { m.close() }
              </Button>
            } />
            <Button type="submit" disabled={ !isValid || isAddingUser }>
              { isAddingUser ?
                <>
                  <Spinner />
                  { m.adding_tenant() }
                </> :
                m.add()
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
