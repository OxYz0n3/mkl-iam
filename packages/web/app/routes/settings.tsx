import { useOutletContext, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import validator from "validator";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ManageIdp } from "@/components/dialogs/manage-idp";
import DeleteTenant from "@/components/dialogs/delete-tenant";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useIdentity, useIdentityProviders } from "@/hooks/use-identity";
import type { MainContext } from "./main";
import { getToken } from "@/lib/auth";
import { app } from "@/lib/api";

import { m } from "@/paraglide/messages";


export default function SettingsPage() {
  const { tenant } = useOutletContext<MainContext>();
  const [ tenantName, setTenantName ] = useState("");
  const [ tenantDomain, setTenantDomain ] = useState("");
  const [ manageIdpOpen, setManageIdpOpen ] = useState(false);
  const [ searchParams, setSearchParams ] = useSearchParams();

  const { data: tenantIdP, isLoading: isTenantIdPLoading } = useIdentity(tenant.id);
  const { data: identityProviders } = useIdentityProviders(tenant.id);

  const hasNameChanged = tenantName.trim() !== tenant.name && tenantName.trim().length > 0;
  const hasDomainChanged = tenantDomain.trim() !== tenant.domain && tenantDomain.trim().length > 0;
  const hasGeneralInfoChanged = hasNameChanged || hasDomainChanged;

  useEffect(() => {
    setTenantName(tenant.name);
    setTenantDomain(tenant.domain);
  }, [ tenant ]);

  useEffect(() => {
    if (searchParams.get('error') === 'not_workspace') {
      toast.error(m.idp_error_not_workspace(), { id: 'idp_error_not_workspace' });
      setSearchParams({}, { replace: true });
    }
  }, [ searchParams ]);

  const handleConnectIdp = async (provider: keyof typeof identityProviders) => {
    const currentPath = window.location.pathname;

    const { data, error } = await app.tenants({ tenantId: tenant.id }).identity({ provider })['login-url'].get({
      headers: {
        Authorization: `Bearer ${ getToken() }`,
      },
      query: {
        redirectTo: currentPath,
        tenantId: tenant.id,
      }
    });

    if (error)
      toast.error(m.error_auth_url());
    else
      window.location.href = data;
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            { m.tenant_settings() }
          </CardTitle>
          <CardDescription>
            { m.tenant_settings_description() }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">{ m.general_information() }</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <Label>
                  { m.tenant_name() }
                </Label>
                <Input 
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                />
              </Field>
              <Field>
                <Label>
                  { m.domain_name() }
                </Label>
                <Input 
                  value={tenantDomain}
                  aria-invalid={ !!tenantDomain && !validator.isFQDN(tenantDomain) }
                  onChange={(e) => setTenantDomain(e.target.value)}
                />
              </Field>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              { m.idp() }
            </h3>
            <p className="text-sm text-muted-foreground">
              { m.idp_description() }
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              { (Object.keys(identityProviders) as Array<keyof typeof identityProviders>).map((providerId) => (
                <Card key={ providerId } className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow p-0">
                  <CardContent className="flex flex-col flex-grow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <img src={ `/icons/${providerId}.svg` } alt={ identityProviders[providerId].name } width={ 32 } height={ 32 } />
                        </div>
                        <h3 className="text-lg font-semibold">{identityProviders[providerId].name}</h3>
                      </div>
                    </div>
                    <p className="flex-grow text-sm text-muted-foreground leading-relaxed">
                      { identityProviders[providerId].description }
                    </p>
                    <Separator className="my-4" />
                    { tenantIdP?.provider === providerId ? (
                      <Button variant="outline" className="w-full" onClick={() => setManageIdpOpen(true)}>
                        { m.manage_object({ object: identityProviders[providerId].name })}
                      </Button>
                    ) : (
                      <Button disabled={ !!tenantIdP || isTenantIdPLoading } className="w-full" onClick={() => handleConnectIdp(providerId) }>
                        { m.connect_object({ object: identityProviders[providerId].name }) }
                      </Button>
                    )
                    }
                  </CardContent>
                </Card>
              )) }
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-muted/50 justify-between">
          <DeleteTenant tenant={ tenant } />
          <Button disabled={!hasGeneralInfoChanged || !validator.isFQDN(tenantDomain)}>
            { m.save_changes() }
          </Button>
        </CardFooter>
      </Card>
      { tenantIdP && (
        <ManageIdp
          tenantId={ tenant.id }
          identity={ tenantIdP }
          providerInfo={ identityProviders[tenantIdP.provider] }
          onReconnect={() => handleConnectIdp(tenantIdP.provider)}
          openState={[ manageIdpOpen, setManageIdpOpen ]}
        />
      ) }
    </div>
  );
}