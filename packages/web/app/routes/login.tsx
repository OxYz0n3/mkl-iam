import { NavLink, useNavigate } from 'react-router';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { app } from '~/lib/api';
import { getToken, setToken } from '~/lib/auth';


export default function LoginPage()
{
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const loginResponse = await app.auth.login.post({ email, password }, { fetch: { credentials: 'include' } });

    if (!loginResponse.error) {
      setToken(loginResponse.data.accessToken);
      console.log(getToken());
      navigate('/');
    } else
      console.log("Erreur de connexion: " + loginResponse.error);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez votre e-mail et votre mot de passe pour vous connecter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <NavLink to="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
                  Mot de passe oublié ?
                </NavLink>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">
            Vous n'avez pas de compte ?
          </div>
          <NavLink to="/auth/register" className="text-sm hover:underline">
            S'inscrire
          </NavLink>
        </CardFooter>
      </Card>
    </div>
  ); 
};
