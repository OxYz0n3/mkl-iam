import { useNavigate } from "react-router";
import { HousePlus } from "lucide-react";
import validator from "validator";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAddTenant } from "@/hooks/use-tenants";


export default function AddTenant() {
  const { trigger: addTenant, isMutating: isAddingTenant } = useAddTenant();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await addTenant({ name, domain: domain.trim().toLowerCase() });

      toast.success("L'entreprise a été ajoutée avec succès !");
      navigate("/");
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout de l'entreprise");
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <HousePlus className="w-5 h-5 text-primary" />
            Ajouter une entreprise
          </CardTitle>
          <CardDescription>
            Créez votre espace de travail en ajoutant le nom de votre entreprise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={ handleSubmit } className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input
                  id="name"
                  placeholder="Ex: MoonkeyLink"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  disabled={isAddingTenant}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Nom de domaine</Label>
                <Input
                  id="domain"
                  placeholder="Ex: moonkeylink.com"
                  value={domain}
                  aria-invalid={ !!domain && !validator.isFQDN(domain) }
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  autoComplete="off"
                  disabled={isAddingTenant}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isAddingTenant || !name || !domain || !validator.isFQDN(domain)}
            >
              { isAddingTenant ?
                <>
                  <Spinner />
                  Ajout en cours...
                </>
              :
                "Ajouter l'entreprise"
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}