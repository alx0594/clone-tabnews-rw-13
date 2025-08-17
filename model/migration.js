import resolve from "node:path";
import { migrationRunner } from "node-pg-migrate";
import database from "infra/database";

const defaultMigrationOptions = {
  migrationsTable: "pgmigrations",
  dir: resolve("infra", "migrations"),
  direction: "up",
  dryRun: true,
  log: () => {},
};

async function listPendingMigrations() {
  let client;
  try {
    client = await database.getNewClient();
    const listPendingMigrations = await migrationRunner({
      defaultMigrationOptions,
    });
  } finally {
    await client?.end();
  }
}

async function runPendingMigrations() {
  return [];
}

const migration = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migration;
