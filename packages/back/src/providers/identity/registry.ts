import type { ProviderKey } from "../../modules/tenants/identity/model";


/**
 * Data-only registry: keys and display metadata for identity providers.
 * Must stay free of service imports — db/schema depends on it for enum keys.
 */
export const identityProviders: Record<ProviderKey, { name: string; description: string }> = {
    'google': {
        name: 'Google Workspace',
        description: 'Intégrez votre annuaire Google Workspace pour gérer les accès de vos employés.',
    },
    'microsoft': {
        name: 'Microsoft Entra ID',
        description: 'Intégrez votre annuaire Microsoft Entra ID pour gérer les accès de vos employés.',
    }
};
