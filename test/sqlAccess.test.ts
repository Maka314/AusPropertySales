import sqlAccess from "../src/sqlAccess";

test("SqlAccess", () => {
    const db = new sqlAccess("/workspace/test123.db");
    // const db = new sqlAccess("/workspace/test.db");

    db.printDb();
});