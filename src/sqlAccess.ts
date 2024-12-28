import { Database } from "sqlite3";

export default class SqlAccess {
  private db!: Database;

  constructor(dbRoute: string) {
    this.init(dbRoute);
  }

  private async init(dbRoute: string) {
    this.db = await new Promise<Database>((resolve, reject) => {
      const db = new Database(dbRoute, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log("Database connected successfully.");
          resolve(db);
        }
      });
    });
  }

  printDb() {
    console.log(this.db);
  };
}