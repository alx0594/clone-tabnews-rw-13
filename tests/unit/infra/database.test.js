import database from "infra/database.js";

describe("Módulo Database", () => {
  describe("Database connect and sucessful query", () => {
    test("getNewClient()", async () => {
      const dbClient = await database.getNewClient();
      console.log(dbClient);
      expect(dbClient._connected).toBe(true);
    });

    test("query(queryObject)", async () => {
      const results = await database.query("SELECT 1 + 1 as SUM");
      expect(results.rows[0].sum).toEqual(2);
    });

    test;
  });
});
