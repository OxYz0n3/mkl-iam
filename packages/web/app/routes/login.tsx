import { NavLink, useNavigate } from 'react-router';
import validator from 'validator';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { setToken, setUser } from '@/lib/auth';
import { app } from '@/lib/api';


export default function LoginPage()
{
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      const loginResponse = await app.auth.login.post({ email, password }, { fetch: { credentials: 'include' } });

      if (loginResponse.error) {
        if (loginResponse.error.status === 400)
          toast.warning('Mot de passe ou adresse e-mail incorrecte.');      
        else
          toast.error('Une erreur est survenue lors de la connexion.');      
      } else {
        setToken(loginResponse.data.accessToken);
        setUser(loginResponse.data.user);
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="min-w-md">
        <CardHeader className="space-y-2">
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
                autoFocus
                aria-invalid={ email && !validator.isEmail(email) ? "true" : "false" }
                autoComplete="email"
                disabled={isLoading}
                tabIndex={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <NavLink to="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline" tabIndex={3}>
                  Mot de passe oublié ?
                </NavLink>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
                tabIndex={2}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !validator.isEmail(email) || !password}
            >
                { isLoading ?
                  <>
                    <Spinner />
                    Connexion en cours...
                  </>
                :
                  "Se connecter"
                }
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">
            Vous n'avez pas de compte ?
          </div>
          <NavLink to="/auth/register" className="text-sm hover:underline" tabIndex={4}>
            S'inscrire
          </NavLink>
        </CardFooter>
      </Card>
    </div>
  ); 
};
