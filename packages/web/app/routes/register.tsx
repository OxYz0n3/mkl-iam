import { NavLink, useNavigate } from 'react-router';
import validator from 'validator';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import { app } from '@/lib/api';


export default function RegisterPage() {
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const registerResponse = await app.auth.register.post({ firstName, lastName, email, password }, { fetch: { credentials: 'include' } });

      if (registerResponse.error) {
        toast.error("Une erreur est survenue lors de l'inscription.");
      } else {
        toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        navigate('/auth/login');
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour vous inscrire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname">Prénom</Label>
                <Input
                  id="firstname"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Nom</Label>
                <Input
                  id="lastname"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
               />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={ email && !validator.isEmail(email) ? "true" : "false" }
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                aria-invalid={ password && passwordConfirmation && password !== passwordConfirmation ? "true" : "false" }
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !validator.isEmail(email) || !firstName || !lastName || !password || password !== passwordConfirmation}
            >
              { isLoading ?
                <>
                  <Spinner />
                  Inscription en cours...
                </>
              :
                "S'inscrire"
              }
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">
            Vous avez déjà un compte ?
          </div>
          <NavLink to="/auth/login" className="text-sm hover:underline">
            Se connecter
          </NavLink>
        </CardFooter>
      </Card>
    </div>
  );
}