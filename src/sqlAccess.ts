import { Database } from "sqlite3";

export default class SqlAccess {
  private db: Database;

  constructor(dbRoute: string) {
    this.db = new Database(dbRoute, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  }

  printDb() {
    console.log(this.db);
  };
}