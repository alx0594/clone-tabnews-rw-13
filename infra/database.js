import { Client } from "pg";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const results = await client.query(queryObject);
    return results;
  } catch (error) {
    throw new ServiceError({
      cause: error,
      message: "Falha na conexão ou query do banco de dados.",
      action:
        "Verificar se o banco de dados está disponível ou se a query está correta.",
    });
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValue(),
  });
  await client.connect();
  return client;
}

function getSSLValue() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === "production" ? true : false;
}

const database = {
  getNewClient,
  query,
};

export default database;
