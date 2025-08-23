import bcrypt from "bcrypt";

async function hash(providedPassword) {
  const roundSalt = getRoundSaltNumer();
  return bcrypt.hash(providedPassword, roundSalt);
}

async function compare(providedPassword, storedPassword) {
  return bcrypt.compare(providedPassword, storedPassword);
}

function getRoundSaltNumer() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

const password = {
  hash,
  compare,
};

export default password;
