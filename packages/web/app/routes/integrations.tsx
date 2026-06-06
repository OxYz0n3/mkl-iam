import { Badge, CheckCircle2, Plug } from "lucide-react";
import { useOutletContext } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ManageIntegration } from "@/components/dialogs/manage-integration";

import { useIntegrations } from "@/hooks/use-integrations";

import { getToken } from "@/lib/auth";
import { app } from "@/lib/api";

import type { Integration } from "@mkl-iam/back/src/tenants/integrations/model";
import type { MainContext } from "./main";

import { m } from "@/paraglide/messages";


export default function Integrations()
{
  const { tenant } = useOutletContext<MainContext>();

  const { data: { addedIntegrations, availableIntegrations }, isLoading } = useIntegrations(tenant.id);

  const [ manageOpen, setManageOpen ] = useState(false);
  const [ managedIntegration, setManagedIntegration ] = useState<Integration | null>(null);

  const isAppConnected = (appId: string) => !!addedIntegrations.find(integration => integration.app === appId);

  const handleManage = (appId: string) => {
    const integration = addedIntegrations.find(i => i.app === appId);
    if (integration) {
      setManagedIntegration(integration);
      setManageOpen(true);
    }
  };

  const handleConnectIntegration = async (appId: 'gitlab-cloud' | 'github') => {
    const currentPath = window.location.pathname;

    const { data, error } = await app.tenants({ tenantId: tenant.id }).integrations[appId]['login-url'].get({
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
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Plug className="w-5 h-5 text-primary" />
            { m.integrations_configuration() }
          </CardTitle>
          <CardDescription>
            { m.integrations_description() }
          </CardDescription>
        </CardHeader>
        <CardContent>
          { isLoading && (
          <div className="flex mt-10 mb-10 items-center justify-center gap-2 text-md text-muted-foreground">
            <Spinner />
            { m.loading_integrations() }
          </div>
          )
          }
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(availableIntegrations).map(([appId, app]) => (
              <Card key={appId} className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow p-0">
                <CardContent className="flex flex-col flex-grow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <img src={`/icons/${ appId }.svg`} alt={`${ app.name } logo`} width={ 32 } height={ 32 } />
                      </div>
                      <h3 className="text-lg font-semibold">{app.name}</h3>
                    </div>
                    {isAppConnected(appId) && (
                      <Badge className="flex items-center gap-1 text-green-800">
                        <CheckCircle2 className="w-3 h-3" />
                        { m.connected() }
                      </Badge>
                    )}
                  </div>
                  <p className="flex-grow text-sm text-muted-foreground leading-relaxed">
                    {app.description}
                  </p>
                  <div className="mt-6 pt-4 border-t border-border/50">
                    {isAppConnected(appId) ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleManage(appId)}
                        >
                          { m.manage_integration() }
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleConnectIntegration(appId) }
                      >
                        { m.connect_object({ object: app.name }) }
                      </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            ))}

          </div>
        </CardContent>
      </Card>
      { managedIntegration && (
        <ManageIntegration
          tenantId={ tenant.id }
          integration={ managedIntegration }
          appInfo={ availableIntegrations[managedIntegration.app] }
          openState={[ manageOpen, setManageOpen ]}
        />
      ) }
    </div>
  );
}
