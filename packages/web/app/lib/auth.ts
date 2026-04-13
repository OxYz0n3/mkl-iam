import { redirect } from "react-router";
import { app } from "./api";

let accessToken: string | null = null;

export const getToken = () => accessToken;
export const setToken = (token: string | null) => accessToken = token;

export async function logout()
{
  await app.auth.logout.post(undefined, { fetch: { credentials: 'include' } });

  setToken(null);
}

export async function requireAuth()
{
  const token = getToken();

  if (token)
    return (token);

  try {
    const { data, error } = await app.auth.refresh.post(undefined, { fetch: { credentials: 'include' } });

    if (error)
      throw redirect("/login");

    setToken(data.accessToken);

    return (data.accessToken);
  } catch (error) {
    throw redirect('/auth/login');
  }
}