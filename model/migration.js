import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";

const defaultMigrationOptions = {
  migrationsTable: "pgmigrations",
  dir: resolve("infra", "migrations"),
  direction: "up",
  dryRun: true,
  log: () => {},
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const listPendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    return listPendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const migratedMigration = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });
    return migratedMigration;
  } finally {
    dbClient?.end();
  }
}

const migration = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migration;
