import { Badge, CheckCircle2, Plug } from "lucide-react";
import { useOutletContext } from "react-router";

import type { MainContext } from "./main";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useIntegrations } from "@/hooks/use-integrations";
import { app } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";


export default function Integrations()
{
  const { tenant } = useOutletContext<MainContext>();

  const { data: { addedIntegrations, availableIntegrations }, isLoading } = useIntegrations(tenant.id);

  const isAppConnected = (appId: string) => !!addedIntegrations.find(integration => integration.app === appId);
  const handleConnectIntegration = async (appId: 'gitlab-cloud') => {
    const currentPath = window.location.pathname;

    const { data, error } = await app.integrations[appId]['login-url'].get({
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
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Plug className="w-5 h-5 text-primary" />
            Configuration des intégrations
          </CardTitle>
          <CardDescription>
            Connectez les outils utilisés par votre entreprise. Nous créerons automatiquement les comptes de vos employés sur ces plateformes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          { isLoading && (
          <div className="flex mt-10 mb-10 items-center justify-center gap-2 text-md text-muted-foreground">
            <Spinner />
            Chargement des intégrations en cours...
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
                        Connecté
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
                          // onClick={() => handleManage(app.id)}
                        >
                          Gérer l'intégration
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleConnectIntegration(appId) }
                      >
                        Connecter {app.name}
                      </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            ))}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
