
import { identityProviders } from "../../utils/identity";
import type { IdentityProviders } from "./model";


export abstract class IdentityService {
    static async getProviders(tenantId: string): Promise<IdentityProviders>
    {
        return (identityProviders);
    }
};
