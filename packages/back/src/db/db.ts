import { drizzle } from "drizzle-orm/bun-sql";

if (!process.env.POSTGRES_URI)
    throw new Error("POSTGRES_URI environment variable is not set");

export const db = drizzle(process.env.POSTGRES_URI);
