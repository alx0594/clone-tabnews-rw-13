import password from "model/password";
import user from "model/user";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion, version } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllService();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

// Inicar PATCH modo guerrilha. Tentar atualizar usuário que não existe
describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/naoExiste",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "alx@gmail.com",
          }),
        }
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

    test("With duplicated email", async () => {
      const user1 = await orchestrator.createUser({
        email: "existe.email@gmail.com",
      });

      const user2 = await orchestrator.createUser({
        username: "Alex",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/Alex", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "existe.email@gmail.com",
        }),
      });
      expect(response.status).toBe(400);
    });

    test("With duplicated 'useranme'", async () => {
      const user1 = await orchestrator.createUser({
        username: "Vitor",
      });
      const user2 = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: user1.username,
          }),
        }
      );

      expect(response.status).toBe(400);
    });

    test("With unique email", async () => {
      const createdUser = await orchestrator.createUser({
        username: "validUser",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/validUser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email.updated@gmail.com",
          }),
        }
      );
      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: "email.updated@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "updatedUser",
          }),
        }
      );
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "updatedUser",
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With valid'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "oldPassword",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword",
          }),
        }
      );
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const storedUser = await user.findOneByUsername(createdUser.username);
      const correctPassword = await password.compare(
        "newPassword",
        storedUser.password
      );
      const incorrectPassword = await password.compare(
        "newPassword1",
        storedUser.password
      );
      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });
  });
});
