import controller from "infra/controller";
import migration from "model/migration.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migration.listPendingMigrations();
  return response.status(200).json([1]);
}

async function postHandler(request, response) {
  const migratedMigrations = await migration.runPendingMigrations();
  return response.status(201).json([2]);
}
