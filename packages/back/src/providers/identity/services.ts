import type { ProviderKey } from "../../modules/tenants/identity/model";

import { OAuthService } from "../oauth";
import { GoogleService } from "./google";
import { MicrosoftService } from "./microsoft";


export const providersServiceMap: Record<ProviderKey, typeof OAuthService> = {
    google: GoogleService,
    microsoft: MicrosoftService,
} as const;
