import { NavLink, useOutletContext } from 'react-router';
import validator from 'validator';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';

import { app } from '@/lib/api';
import { getToken } from '@/lib/auth';

import type { User } from '@mkl-iam/back/src/auth/model';
import { useUpdateProfile } from '@/hooks/use-account';


export default function AccountPage() {
  const { user } = useOutletContext<{ user: User }>();
  const { trigger: updateProfile, isMutating: isUpdatingProfile } = useUpdateProfile();

  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Profile form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    await updateProfile({ firstName, lastName, email });
      // setUser(response.data);
      toast.success("Profil mis à jour avec succès.");
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingPassword(true);

    try {
      const token = getToken();
      const response = await app.auth['change-password'].post(
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          fetch: { credentials: 'include' },
        }
      );

      if (response.error) {
        if (response.error?.status === 400) {
          toast.error("Le mot de passe actuel est incorrect.");
        } else {
          toast.error("Erreur lors du changement de mot de passe.");
        }
      } else {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success("Mot de passe changé avec succès.");
      }
    } catch (error) {
      toast.error("Erreur lors du changement de mot de passe.");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const isProfileFormValid = firstName && lastName && email && validator.isEmail(email);
  const isPasswordFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Parametres du compte</CardTitle>
          <CardDescription>
            Mettez a jour vos informations personnelles et votre mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenom</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isUpdatingProfile}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isUpdatingProfile}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isUpdatingProfile}
                aria-invalid={email && !validator.isEmail(email) ? 'true' : 'false'}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isUpdatingProfile || !isProfileFormValid}
              className="w-full"
            >
              {isUpdatingProfile ? (
                <>
                  <Spinner />
                  Mise a jour en cours...
                </>
              ) : (
                'Mettre a jour le profil'
              )}
            </Button>
          </form>

          <Separator />

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <NavLink to="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline" tabIndex={3}>
                    Mot de passe oublié ?
                </NavLink>
              </div>
              <Input
                id="currentPassword"
                type="password"
                placeholder="********"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoadingPassword}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoadingPassword}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 caracteres</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoadingPassword}
                required
                autoComplete="new-password"
                aria-invalid={
                  confirmPassword && newPassword && newPassword !== confirmPassword
                    ? 'true'
                    : 'false'
                }
              />
              {confirmPassword && newPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoadingPassword || !isPasswordFormValid}
              className="w-full"
            >
              {isLoadingPassword ? (
                <>
                  <Spinner />
                  Changement en cours...
                </>
              ) : (
                'Changer le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
