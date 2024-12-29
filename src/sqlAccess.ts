import { Database } from "sqlite3";

const yearDownloadBaseUrl =
  "https://www.valuergeneral.nsw.gov.au/__psi/yearly/";
const weekDownloadBaseUrl =
  "https://www.valuergeneral.nsw.gov.au/__psi/weekly/";

export default class SqlAccess {
  private db!: Database;
  public hold: Promise<void>;

  constructor(dbRoute: string) {
    this.hold = this.init(dbRoute);
  }

  async printDbStatus() {
    await this.hold;
    console.log("Database status:", this.db);
  }

  async setupSchema() {
    await this.hold;

    // Create the index table
    await this.asyncRun(`CREATE TABLE IF NOT EXISTS current_year_weeks_index (
          date TEXT NOT NULL PRIMARY KEY,
          obtained BOOLEAN NOT NULL
        )`);
    await this.asyncRun(`CREATE TABLE IF NOT EXISTS old_years_index (
          year TEXT NOT NULL PRIMARY KEY,
          obtained BOOLEAN NOT NULL
        )`);

    // Insert years date into old_years_index
    const currentYear = new Date().getFullYear();
    for (let year = 1990; year < currentYear; year++) {
      this.asyncGet(`SELECT 1 FROM old_years_index WHERE year = ${year}`).then(
        (rows) => {
          if (rows.length === 0) {
            this.asyncRun(
              `INSERT INTO old_years_index (year, obtained) VALUES (${year}, false)`
            );
          }
        }
      );
    }

    // Insert weeks date into current_year_weeks_index
    const mondayOfYear = new Date(currentYear, 0, 1);
    const currentDate = new Date();
    while (mondayOfYear.getDay() !== 1) {
      mondayOfYear.setDate(mondayOfYear.getDate() + 1);
    }
    for (
      ;
      mondayOfYear < currentDate;
      mondayOfYear.setDate(mondayOfYear.getDate() + 7)
    ) {
      const dateString = mondayOfYear.toYYMMDD();
      await this.asyncGet(
        `select 1 from current_year_weeks_index where date = '${dateString}'`
      ).then((rows) => {
        if (rows.length === 0) {
          this.asyncRun(
            `INSERT INTO current_year_weeks_index (date, obtained) VALUES ('${dateString}', false)`
          );
        }
      });
    }
  }

  private async init(dbRoute: string) {
    this.db = await new Promise<Database>((resolve, reject) => {
      const db = new Database(dbRoute, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }

  private async asyncRun(command: string) {
    await this.hold;
    return new Promise<void>((resolve, reject) => {
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

declare global {
  interface Date {
    toYYMMDD(): string;
  }
}

Date.prototype.toYYMMDD = function (): string {
  const year = this.getFullYear();
  const month = this.getMonth() + 1;
  const day = this.getDate();
  return `${year}${month < 10 ? "0" : ""}${month}${day < 10 ? "0" : ""}${day}`;
};
