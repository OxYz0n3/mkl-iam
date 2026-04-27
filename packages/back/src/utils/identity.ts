import { ProviderKey } from "../tenants/identity/model";


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
