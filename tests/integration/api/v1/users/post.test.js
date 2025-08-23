import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "model/user";
import password from "model/password";

beforeAll(async () => {
  await orchestrator.waitForAllService();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Alex",
          email: "alex@gmail.com",
          password: "senha1234",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "Alex",
        email: "alex@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toEqual(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userStored = await user.findOneByUsername("Alex");
      const correctPassword = await password.compare(
        "senha1234",
        userStored.password
      );

      const incorrectPassword = await password.compare(
        "senhaIncorreta",
        userStored.password
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });

    test("With duplicate 'username'", async () => {
      const userCreated = await orchestrator.createUser({
        username: "usernameDuplicado",
      });

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameDuplicado",
          email: userCreated.email,
          password: userCreated.password,
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      console.log(responseBody);
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username já está sendo utilizado.",
        action: "Usar outro username para realizar o cadastro",
        status_code: 400,
      });
    });

    test("with duplicate 'email'", async () => {
      const userCreated = await orchestrator.createUser({
        email: "duplicado@gmail.com",
      });
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "duplicado@gmail.com",
          password: userCreated.password,
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email utilizado já está cadastrado.",
        action: "Utilizar outro email para realizar esta operação.",
        status_code: 400,
      });
    });
  });
});
