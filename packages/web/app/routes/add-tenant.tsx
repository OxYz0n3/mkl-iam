import { useNavigate } from "react-router";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app } from "@/lib/api";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";


export default function AddTenant() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      const { error } = await app.tenants.post({ name }, { headers: { 'Authorization': `Bearer ${ getToken() }` } });

      if (!error) {
        navigate('/')
      } else {
        toast.error("Une erreur est survenue lors de l'ajout de l'entreprise");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout de l'entreprise");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Ajouter une entreprise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={ handleSubmit } className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entreprise</Label>
              <Input
                id="name"
                placeholder="Ex: MoonkeyLink"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !name}
            >
              { isLoading ?
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