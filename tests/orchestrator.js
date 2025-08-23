import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database";
import migration from "model/migration";
import user from "model/user.js";

async function waitForAllService() {
  await waitForWebService();

  async function waitForWebService() {
    retry(fetchStatusPge, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPge() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("DROP schema public cascade; CREATE schema public;");
}

async function runPendingMigrations() {
  await migration.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/.-_/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "validaPassword",
  });
}

const orchestrator = {
  waitForAllService,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
