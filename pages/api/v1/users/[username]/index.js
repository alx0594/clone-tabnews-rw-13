import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "model/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(pathHandler);
export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function pathHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;
  const updatedUser = await user.update(username, userInputValues);
  return response.status(201).json(updatedUser);
}
