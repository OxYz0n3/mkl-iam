import { NavLink, useNavigate } from 'react-router';
import validator from 'validator';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as m from '@/paraglide/messages';
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
        toast.error(m.register_error_generic());
      } else {
        toast.success(m.register_success());
        navigate('/auth/login');
      }
    } catch (error) {
      toast.error(m.register_error_generic());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">{m.register_title()}</CardTitle>
          <CardDescription>
            {m.register_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname">{m.first_name()}</Label>
                <Input
                  id="firstname"
                  placeholder={m.first_name_placeholder()}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">{m.last_name()}</Label>
                <Input
                  id="lastname"
                  placeholder={m.last_name_placeholder()}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
               />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{m.email_address()}</Label>
              <Input
                id="email"
                type="email"
                placeholder={m.email_placeholder()}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={ email && !validator.isEmail(email) ? "true" : "false" }
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{m.password()}</Label>
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
              <Label htmlFor="password_confirmation">{m.confirm_password()}</Label>
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
                  {m.registering()}
                </>
              :
                m.register()
              }
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">
            {m.already_have_account()}
          </div>
          <NavLink to="/auth/login" className="text-sm hover:underline">
            {m.login()}
          </NavLink>
        </CardFooter>
      </Card>
    </div>
  );
}