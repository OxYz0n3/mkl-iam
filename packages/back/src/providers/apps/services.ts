import type { IntegrationKey } from "../../modules/tenants/integrations/model";
import type { TenantIntegrationService } from "./base";

import { GitHubService } from "./github";


export const integrationServices: Record<IntegrationKey, typeof TenantIntegrationService> = {
    'github': GitHubService
};
