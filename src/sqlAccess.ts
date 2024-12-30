import { Database } from 'sqlite3';

import { tradingHistory } from './tradingHistoryParse';

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

  async insertTradingHistory(dataRow: tradingHistory) {
    await this.hold;
    const {
      property_id,
      dealing_number,
      contract_date,
      settlement_date,
      district_code,
      purchase_price,
      purchaser_count,
      vendor_count,
      property_name,
      property_unit_number,
      property_house_number,
      property_street_name,
      property_locality,
      property_postcode,
      area,
      area_type,
      zoning,
      nature_of_property,
      primary_purpose,
      strata_lot_number,
      conponent_code,
      sale_code,
      interest_of_sale,
      property_legal_description,
    } = dataRow;

    await this.asyncRun(
      `INSERT INTO trading_history (
        property_id,
        dealing_number,
        contract_date,
        settlement_date,
        district_code,
        purchase_price,
        purchaser_count,
        vendor_count,
        property_name,
        property_unit_number,
        property_house_number,
        property_street_name,
        property_locality,
        property_postcode,
        area,
        area_type,
        zoning,
        nature_of_property,
        primary_purpose,
        strata_lot_number,
        conponent_code,
        sale_code,
        interest_of_sale,
        property_legal_description
      ) VALUES (
        '${property_id}',
        '${dealing_number}',
        '${contract_date}',
        '${settlement_date}',
        '${district_code}',
        ${purchase_price},
        ${purchaser_count},
        ${vendor_count},
        '${property_name || 'NULL'}',
        '${property_unit_number || 'NULL'}',
        '${property_house_number || 'NULL'}',
        '${property_street_name || 'NULL'}',
        '${property_locality || 'NULL'}',
        '${property_postcode || 'NULL'}',
        '${area || 'NULL'}',
        '${area_type || 'NULL'}',
        '${zoning || 'NULL'}',
        '${nature_of_property || 'NULL'}',
        '${primary_purpose || 'NULL'}',
        ${strata_lot_number || 'NULL'},
        '${conponent_code || 'NULL'}',
        ${sale_code || 'NULL'},
        ${interest_of_sale || 'NULL'},
        '${property_legal_description || 'NULL'}'
      )`
    );
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

    // Create the trading history table
    await this.asyncRun(`CREATE TABLE IF NOT EXISTS trading_history (
        property_id TEXT NOT NULL,
        dealing_number TEXT NOT NULL,
        contract_date TEXT NOT NULL,
        settlement_date TEXT NOT NULL,
        district_code TEXT NOT NULL,
        purchase_price INTEGER NOT NULL,
        purchaser_count INTEGER NOT NULL,
        vendor_count INTEGER NOT NULL,
        property_name TEXT,
        property_unit_number TEXT,
        property_house_number TEXT,
        property_street_name TEXT,
        property_locality TEXT,
        property_postcode TEXT,
        area TEXT,
        area_type TEXT,
        zoning TEXT,
        nature_of_property TEXT,
        primary_purpose TEXT,
        strata_lot_number INTEGER,
        conponent_code TEXT,
        sale_code INTEGER,
        interest_of_sale integer,
        property_legal_description TEXT,
        PRIMARY KEY (property_id, dealing_number)
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
  return `${year}${month < 10 ? '0' : ''}${month}${day < 10 ? '0' : ''}${day}`;
};
