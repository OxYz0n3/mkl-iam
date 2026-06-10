import { Check } from "lucide-react";

import { FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

import { useIntegrationResources } from "@/hooks/use-integrations";

import type { RoleConfigProps } from "./registry";

import { m } from "@/paraglide/messages";


export function GithubRoleConfig({ tenantId, integrationId, value, onChange }: RoleConfigProps) {
  const { data: { resources }, isLoading } = useIntegrationResources(tenantId, integrationId);

  const selected = (value?.projects as string[] | undefined) ?? [];

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((project) => project !== id) : [ ...selected, id ];
    onChange({ projects: next });
  };

  return (
    <div className="mt-3 space-y-2">
      { isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          { m.loading() }
        </div>
      ) : resources.length === 0 ? (
        <FieldDescription>{ m.role_no_resources() }</FieldDescription>
      ) : (
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto rounded-md border p-1">
          { resources.map((repository: { id: string; name: string }) => {
            const isSelected = selected.includes(repository.id);

            return (
              <button
                type="button"
                key={ repository.id }
                onClick={() => toggle(repository.id)}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span className={`flex size-4 shrink-0 items-center justify-center rounded border ${ isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40" }`}>
                  { isSelected && <Check className="size-3" /> }
                </span>
                { repository.name }
              </button>
            );
          }) }
        </div>
      ) }
      <FieldDescription>{ m.role_projects_description() }</FieldDescription>
    </div>
  );
}
