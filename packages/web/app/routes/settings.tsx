import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import type { MainContext } from "./main";
import { app } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { Settings } from "lucide-react";

// --- Logos SVG ---
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);


export default function SettingsPage() {
  const { tenant } = useOutletContext<MainContext>();
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    setTenantName(tenant.name);
  }, [ tenant ]);

  const hasNameChanged = tenantName.trim() !== tenant.name && tenantName.trim().length > 0;

  const handleConnectIdp = async (provider: 'google') => {
    const currentPath = window.location.pathname;

    console.log("Requesting login URL for provider:", provider, "with redirectTo:", currentPath);
    const { data, error } = await app.auth[provider]['login-url'].get({
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
            Paramètres de l'entreprise
            </CardTitle>
          <CardDescription>
            Gérez les informations de votre espace de travail et vos connexions de sécurité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Informations générales</h3>
            <Field>
              <Label>Nom de l'entreprise</Label>
              <Input 
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </Field>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Single Sign-On (SSO)</h3>
            <p className="text-sm text-muted-foreground">
              Liez un annuaire externe pour permettre à vos employés de se connecter en un clic et d'importer leurs comptes.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button 
                variant="outline" 
                className="h-14 flex justify-start px-4"
                onClick={() => handleConnectIdp('google')}
              >
                <GoogleIcon />
                <div className="flex flex-col items-start ml-2 text-left">
                  <span className="font-semibold">Google Workspace</span>
                  <span className="text-xs text-muted-foreground font-normal">Connecter l'annuaire</span>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="h-14 flex justify-start px-4"
                onClick={() => handleConnectIdp('azure')}
              >
                <MicrosoftIcon />
                <div className="flex flex-col items-start ml-2 text-left">
                  <span className="font-semibold">Azure Entra ID</span>
                  <span className="text-xs text-muted-foreground font-normal">Connecter l'annuaire</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-muted/50 pt-6">
          <Button disabled={!hasNameChanged}>
            Enregistrer les modifications
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}