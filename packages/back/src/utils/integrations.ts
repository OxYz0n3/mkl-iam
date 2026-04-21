const integrationKeys = ['gitlab-cloud', 'gitlab-self-hosted', 'github', 'slack', 'notion'] as const;
type IntegrationKey = typeof integrationKeys[number];

export const integrations: Record<IntegrationKey, { name: string; description: string; type: 'oauth' | 'accessToken' }> = {
    'gitlab-cloud': {
        name: 'GitLab Cloud',
        description: 'Provisionnez des comptes développeurs et gérez les accès aux groupes.',
        type: 'oauth',
    },
    'gitlab-self-hosted': {
        name: 'GitLab Self-Hosted',
        description: 'Provisionnez des comptes développeurs et gérez les accès aux groupes.',
        type: 'accessToken',
    },
    'github': {
        name: 'GitHub',
        description: 'Créez des comptes et gérez les accès à vos organisations GitHub.',
        type: 'oauth',
    },
    'slack': {
        name: 'Slack',
        description: 'Invitez automatiquement les nouveaux employés dans votre espace de travail.',
        type: 'oauth',
    },
    'notion': {
        name: 'Notion',
        description: 'Créer des comptes et gérez les accès à votre espace d\'équipe Notion.',
        type: 'oauth',
    },
};
