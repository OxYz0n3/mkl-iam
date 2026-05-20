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
          toast.warning(m.login_error_invalid_credentials());      
        else
          toast.error(m.login_error_generic());      
      } else {
        setToken(loginResponse.data.accessToken);
        setUser(loginResponse.data.user);
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast.error(m.login_error_generic());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="min-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">{m.connection()}</CardTitle>
          <CardDescription>
            {m.login_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{m.email_address()}</Label>
              <Input
                id="email"
                type="email"
                placeholder={m.email_placeholder()}
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
                <Label htmlFor="password">{m.password()}</Label>
                <NavLink to="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline" tabIndex={3}>
                  {m.forgot_password()}
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
                    {m.logging_in()}
                  </>
                :
                  m.login()
                }
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2">
          <div className="text-sm text-muted-foreground">
            {m.no_account()}
          </div>
          <NavLink to="/auth/register" className="text-sm hover:underline" tabIndex={4}>
            {m.register()}
          </NavLink>
        </CardFooter>
      </Card>
    </div>
  ); 
};
