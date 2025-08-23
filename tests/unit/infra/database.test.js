import database from "infra/database.js";

describe("Módulo Database", () => {
  describe("Database connect and sucessful query", () => {
    test("getNewClient()", async () => {
      let dbClient;
      try {
        dbClient = await database.getNewClient();
        expect(dbClient._connected).toBe(true);
      } finally {
        dbClient?.end();
      }
    });

    test("query(queryObject)", async () => {
      const results = await database.query("SELECT 1 + 1 as SUM");
      expect(results.rows[0].sum).toEqual(2);
    });

    test;
  });
});
