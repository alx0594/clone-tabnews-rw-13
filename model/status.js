import database from "infra/database.js";

async function getDatabaseVersion() {
  const { server_version } = (await database.query("SHOW server_version"))
    .rows[0];
  return server_version;
}

async function getDatabaseMaxConnections() {
  const { max_connections } = (await database.query("SHOW max_connections"))
    .rows[0];
  return parseInt(max_connections);
}

async function getDatabaseOpenedConnections() {
  const databaseName = process.env.POSTGRES_DB;
  const { count } = (
    await database.query({
      text: `
      SELECT 
        count(*)::int
      FROM
        pg_stat_activity
      WHERE
        datname = $1
    ;`,
      values: [databaseName],
    })
  ).rows[0];
  return count;
}

const status = {
  getDatabaseVersion,
  getDatabaseMaxConnections,
  getDatabaseOpenedConnections,
};

export default status;
