import { Database } from 'sqlite3';

export default class SqlAccess {
  private db!: Database;
  public hold: Promise<void>;

  constructor(dbRoute: string) {
    this.hold = this.init(dbRoute);
  }

  async printDbStatus() {
    await this.hold;
    console.log('Database status:', this.db);
  }

  private async init(dbRoute: string) {
    this.db = await new Promise<Database>((resolve, reject) => {
      const db = new Database(dbRoute, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connected successfully.');
          resolve(db);
        }
      });
    });
  }

  private async asyncRun(command: string) {
    await this.hold;
    new Promise<void>((resolve, reject) => {
      this.db.run(command, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async asyncGet(command: string) {
    await this.hold;
    return new Promise<any[]>((resolve, reject) => {
      this.db.all(command, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}
