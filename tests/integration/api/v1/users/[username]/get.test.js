import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllService();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    test("With exact case match", async () => {
      const userCreated = await orchestrator.createUser({
        username: "Alex",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/Alex");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "Alex",
        email: userCreated.email,
        password: userCreated.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch 'username'", async () => {
      const userCreated = await orchestrator.createUser({
        username: "diferentecase",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/DiferenteCase"
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não cadastrado.",
        action: "Verifique a consulta com o usuário válido.",
        status_code: 404,
      });
    });

    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/userNotFound"
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não cadastrado.",
        action: "Verifique a consulta com o usuário válido.",
        status_code: 404,
      });
    });
  });
});
