import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/error.js";
import password from "model/password.js";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          username = $1
        LIMIT
          1
      ;`,
      values: [username],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Usuário não cadastrado.",
        action: "Verifique a consulta com o usuário válido.",
      });
    }
    return results.rows[0];
  }
}

async function create(userInputValues) {
  await uniqueUsernameValidate(userInputValues.username);
  await uniqueEmailValidate(userInputValues.email);
  await hashPasswordObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password) 
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const correntUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await uniqueUsernameValidate(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await uniqueEmailValidate(userInputValues.email);
  }

  // Antes de atualizar nova senha, deveira validar o match da senha antiga.
  if ("password" in userInputValues) {
    await hashPasswordObject(userInputValues);
  }

  const updatedUserValues = { ...correntUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(updatedUserValues);
  return updatedUser;

  async function runUpdateQuery(updatedUserValues) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [
        updatedUserValues.id,
        updatedUserValues.username,
        updatedUserValues.email,
        updatedUserValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function uniqueUsernameValidate(username) {
  const results = await database.query({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
    ;`,
    values: [username],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username já está sendo utilizado.",
      action: "Usar outro username para realizar o cadastro",
    });
  }
}

async function uniqueEmailValidate(email) {
  const results = await database.query({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = $1
    ;`,
    values: [email],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email utilizado já está cadastrado.",
      action: "Utilizar outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordObject(userInputValues) {
  userInputValues.password = await password.hash(userInputValues.password);
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
