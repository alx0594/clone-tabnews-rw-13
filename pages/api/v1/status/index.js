import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import status from "model/status.js";
const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();
  return response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: await status.getDatabaseVersion(),
        max_connections: await status.getDatabaseMaxConnections(),
        opened_connections: await status.getDatabaseOpenedConnections(),
      },
    },
  });
}
