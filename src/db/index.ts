import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type AppDatabase = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;
let database: AppDatabase | undefined;

export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  pool = new Pool({ connectionString });
  return pool;
}

export function getDb(): AppDatabase {
  if (!database) {
    database = drizzle(getPool(), { schema });
  }

  return database;
}
