import { redirect } from "react-router";
import { app } from "./api";
import type { User } from "@mkl-iam/back/src/auth/model";


let accessToken: string | null = null;
let user: User | null = null;

export const getToken = () => accessToken;
export const setToken = (token: string | null) => accessToken = token;
export const getUser: () => User | null = () => user;
export const setUser = (user: User | null) => user = user;

export async function logout()
{
  await app.auth.logout.post(undefined, { fetch: { credentials: 'include' } });

  setToken(null);
  setUser(null);
}

export async function requireAuth(): Promise<{ accessToken: string, user: User }>
{
  const token = getToken();
  const user  = getUser();

  if (token && user)
    return { accessToken: token, user };

  try {
    const { data, error } = await app.auth.refresh.post(undefined, { fetch: { credentials: 'include' } });

    if (error)
      throw redirect("/login");

    setToken(data.accessToken);
    setUser(data.user);

    return { accessToken: data.accessToken, user: data.user };
  } catch (error) {
    throw redirect('/auth/login');
  }
}
