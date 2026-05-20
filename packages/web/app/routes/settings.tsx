import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import validator from "validator";
import { toast } from "sonner";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DeleteTenant from "@/components/dialogs/delete-tenant";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDeleteIdentity, useIdentity, useIdentityProviders } from "@/hooks/use-identity";
import type { MainContext } from "./main";
import { getToken } from "@/lib/auth";
import { app } from "@/lib/api";

import { m } from "@/paraglide/messages";


export default function SettingsPage() {
  const { tenant } = useOutletContext<MainContext>();
  const [ tenantName, setTenantName ] = useState("");
  const [ tenantDomain, setTenantDomain ] = useState("");

  const { data: tenantIdP, isLoading: isTenantIdPLoading } = useIdentity(tenant.id);
  const { data: identityProviders } = useIdentityProviders(tenant.id);
  const { trigger: deleteIdentity } = useDeleteIdentity(tenant.id);

  const hasNameChanged = tenantName.trim() !== tenant.name && tenantName.trim().length > 0;
  const hasDomainChanged = tenantDomain.trim() !== tenant.domain && tenantDomain.trim().length > 0;
  const hasGeneralInfoChanged = hasNameChanged || hasDomainChanged;

  useEffect(() => {
    setTenantName(tenant.name);
    setTenantDomain(tenant.domain);
  }, [ tenant ]);

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
      toast.error("Failed to get authentication URL. Please try again.");
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
            Gérez les informations de votre espace de travail et vos connexions de sécurité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Informations générales</h3>
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
              Liez un annuaire externe pour permettre à vos employés de se connecter en un clic et d'importer leurs comptes.
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
                      <Dialog>
                        <DialogTrigger>
                          <Button variant="outline" className="w-full">
                            { m.manage_object({ object: identityProviders[providerId].name })}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                          <DialogHeader>
                            <DialogTitle>Gérer la connexion { identityProviders[providerId].name }</DialogTitle>
                          </DialogHeader>
                          <DialogFooter className="sm:flex-wrap">
                            <DialogClose>
                              <Button variant="outline">
                                { m.close() }
                              </Button>
                            </DialogClose>
                            <Button onClick={() => handleConnectIdp(providerId) } className="w-full sm:w-auto">
                              Reconnecter { identityProviders[providerId].name }
                            </Button>
                            <Button variant="destructive" onClick={() => deleteIdentity() } className="w-full whitespace-normal text-center leading-tight sm:w-auto">
                              Supprimer la connexion { identityProviders[providerId].name }
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
    </div>
  );
}