import type { IntegrationKey } from "@mkl-iam/back/src/modules/tenants/integrations/model";

import { GithubRoleConfig } from "./github";


export type RoleConfigProps = {
  tenantId: string;
  integrationId: string;
  value: Record<string, unknown> | undefined;
  onChange: (config: Record<string, unknown>) => void;
};

/**
 * Maps an integration to the React component that renders its per-role config.
 * Add an entry here (and a backend variant in roles/model.ts) when wiring up
 * a new integration.
 */
export const CONFIG_FORMS: Partial<Record<IntegrationKey, React.FC<RoleConfigProps>>> = {
  github: GithubRoleConfig,
};

export const DEFAULT_CONFIG: Partial<Record<IntegrationKey, Record<string, unknown>>> = {
  github: { projects: [] },
};
