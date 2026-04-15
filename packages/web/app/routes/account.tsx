import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { toast } from 'sonner';
import validator from 'validator';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Spinner } from '~/components/ui/spinner';
import { Separator } from '~/components/ui/separator';

import { app } from '~/lib/api';
import { getToken, setUser } from '~/lib/auth';

import type { User } from '@mkl-iam/back/src/auth/model';


export default function AccountPage() {
  const { user } = useOutletContext<{ user: User }>();

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Profile form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingProfile(true);

    try {
      const token = getToken();
      const response = await app.account.profile.put(
        { firstName, lastName, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          fetch: { credentials: 'include' },
        }
      );

      if (response.error) {
        if (response.error?.status === 409) {
          toast.error("Cet email est déjà utilisé.");
        } else {
          toast.error("Erreur lors de la mise à jour du profil.");
        }
      } else {
        // Update local state with new values
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setEmail(response.data.email);
        // Update global user context
        setUser(response.data);
        toast.success("Profil mis à jour avec succès.");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setIsLoadingProfile(false);
    }
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
    <div className="min-h-screen bg-muted/50 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres du compte</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations personnelles et vos paramètres de sécurité.
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Mettez à jour vos informations de profil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoadingProfile}
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
                    disabled={isLoadingProfile}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoadingProfile}
                  aria-invalid={email && !validator.isEmail(email) ? "true" : "false"}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoadingProfile || !isProfileFormValid}
                className="w-full"
              >
                {isLoadingProfile ? (
                  <>
                    <Spinner />
                    Mise à jour en cours...
                  </>
                ) : (
                  "Mettre à jour le profil"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>
              Mettez à jour votre mot de passe pour maintenir la sécurité de votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
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
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoadingPassword}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 caractères
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoadingPassword}
                  required
                  autoComplete="new-password"
                  aria-invalid={
                    confirmPassword && newPassword && newPassword !== confirmPassword
                      ? "true"
                      : "false"
                  }
                />
                {confirmPassword && newPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    Les mots de passe ne correspondent pas
                  </p>
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
                  "Changer le mot de passe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
