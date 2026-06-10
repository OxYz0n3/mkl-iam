import { useEffect, useState } from "react";
import { toast } from "sonner";

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

import { CONFIG_FORMS, DEFAULT_CONFIG } from "@/components/role-config/registry";
import { useIntegrations } from "@/hooks/use-integrations";
import { useUpsertRole } from "@/hooks/use-roles";

import type { Role, UpsertRole } from "@mkl-iam/back/src/modules/tenants/roles/model";
import type { Tenant } from "@mkl-iam/back/src/modules/tenants/model";
import { m } from "@/paraglide/messages";


type IntegrationState = Record<string, { selected: boolean; config: Record<string, unknown> }>;

export function UpsertRole({ tenant, role, openState }: { tenant: Tenant; role?: Role; openState: [boolean, React.Dispatch<React.SetStateAction<boolean>>] })
{
  const { trigger: upsertRole, isMutating } = useUpsertRole(tenant.id);
  const { data: { addedIntegrations, availableIntegrations } } = useIntegrations(tenant.id);

  const [ open, setOpen ] = openState;
  const [ name, setName ] = useState("");
  const [ integrations, setIntegrations ] = useState<IntegrationState>({});

  useEffect(() => {
    setName(role?.name || "");

    const initial: IntegrationState = {};
    for (const integration of addedIntegrations) {
      const existing = role?.integrations.find((i) => i.integrationId === integration.id);

      initial[integration.id] = {
        selected: !!existing,
        config: existing?.config ?? DEFAULT_CONFIG[integration.app] ?? {},
      };
    }
    setIntegrations(initial);
  }, [ role, addedIntegrations ]);

  const toggle = (integrationId: string) => setIntegrations((prev) => ({
    ...prev,
    [integrationId]: { ...prev[integrationId], selected: !prev[integrationId].selected },
  }));

  const setConfig = (integrationId: string, config: Record<string, unknown>) => setIntegrations((prev) => ({
    ...prev,
    [integrationId]: { ...prev[integrationId], config },
  }));

  const isValid = name.trim() !== "";

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const selectedIntegrations = addedIntegrations
      .filter((integration) => integrations[integration.id]?.selected)
      .map((integration) => ({
        integrationId: integration.id,
        app: integration.app,
        config: integrations[integration.id].config,
      }));

    await upsertRole({
      roleId: role?.id,
      body: { name: name.trim(), integrations: selectedIntegrations } as UpsertRole,
    });

    toast.success(role ? m.role_update_success() : m.role_add_success());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={ handleSubmit } className="space-y-6">
          <DialogHeader>
            <DialogTitle>{ role ? m.role_edit() : m.roles_add() }</DialogTitle>
            <DialogDescription>{ m.role_upsert_description() }</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label>{ m.role_name() }</Label>
              <Input required placeholder={ m.role_name_placeholder() } value={ name } onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field>
              <Label>{ m.role_integrations() }</Label>
              { addedIntegrations.length === 0 ? (
                <FieldDescription>{ m.role_no_integrations() }</FieldDescription>
              ) : (
                <div className="flex flex-col gap-2">
                  { addedIntegrations.map((integration) => {
                    const selected = !!integrations[integration.id]?.selected;
                    const Form = CONFIG_FORMS[integration.app];

                    return (
                      <div key={ integration.id } className={`rounded-lg border p-3 transition-colors ${ selected ? "border-primary bg-primary/5" : "border-border" }`}>
                        <button type="button" onClick={() => toggle(integration.id)} className="flex w-full items-center gap-3 text-left">
                          <div className="p-1.5 bg-muted rounded-md shrink-0">
                            <img src={`/icons/${ integration.app }.svg`} alt={`${ availableIntegrations[integration.app]?.name } logo`} width={ 20 } height={ 20 } />
                          </div>
                          <span className="flex-grow text-sm font-medium">{ availableIntegrations[integration.app]?.name || integration.app }</span>
                          <span className={`size-4 rounded-full border ${ selected ? "border-primary bg-primary" : "border-muted-foreground/40" }`} />
                        </button>
                        { selected && Form && (
                          <Form
                            key={ role?.id ?? 'new' }
                            tenantId={ tenant.id }
                            integrationId={ integration.id }
                            value={ integrations[integration.id].config }
                            onChange={(config) => setConfig(integration.id, config)}
                          />
                        ) }
                      </div>
                    );
                  }) }
                </div>
              ) }
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={
              <Button variant="outline">
                { m.close() }
              </Button>
            } />
            <Button type="submit" disabled={ !isValid || isMutating }>
              { isMutating ?
                <>
                  <Spinner />
                  { m.loading() }
                </> :
                (role ? m.save_changes() : m.add())
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
