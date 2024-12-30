import axios from 'axios';
import AdmZip from 'adm-zip';

const yearDownloadBaseUrl =
  'https://www.valuergeneral.nsw.gov.au/__psi/yearly/';
const weekDownloadBaseUrl =
  'https://www.valuergeneral.nsw.gov.au/__psi/weekly/';

export interface tradingHistory {
  property_id: string;
  dealing_number: string;
  contract_date: string;
  settlement_date: string;
  district_code: string;
  purchase_price: number;
  purchaser_count: number;
  vendor_count: number;
  property_name?: string;
  property_unit_number?: string;
  property_house_number?: string;
  property_street_name?: string;
  property_locality?: string;
  property_postcode?: string;
  area?: string;
  area_type?: string;
  zoning?: string;
  nature_of_property?: string;
  primary_purpose?: string;
  strata_lot_number?: string;
  conponent_code?: string;
  sale_code?: string;
  interest_of_sale?: string;
  property_legal_description?: string;
  description?: string;
}

export async function downloadYearPack(year: number) {
  const url = yearDownloadBaseUrl + year + '.zip';
  const yearDatas = await axios.get(url, { responseType: 'arraybuffer' });
  const zip = new AdmZip(yearDatas.data);

  const datFiles = getAllDatFiles(zip);
  datFiles.forEach((datFile) => {
    const datas = parseDatFile(datFile);
    datas.forEach((data) => {
      // Save data to database
    });
  });
}

// This function is used to get all the .DAT files in the zip file
function getAllDatFiles(zip: AdmZip): string[] {
  let datFiles: string[] = [];

  const zipEntries = zip.getEntries();
  zipEntries.forEach((entry) => {
    if (entry.entryName.endsWith('.DAT')) {
      datFiles.push(entry.getData().toString('utf8'));
    } else if (entry.entryName.endsWith('.zip')) {
      const datInSubZip = getAllDatFiles(new AdmZip(entry.getData()));
      datFiles = datFiles.concat(datInSubZip);
    }
  });

  return datFiles;
}

function parseDatFile(datFile: string): tradingHistory[] {
  let tradingHistories: tradingHistory[] = [];

  const lines = datFile.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const elements = lines[i].split(';');
    if (elements[0] === 'A') {
      continue;
    } else if (elements[0] === 'B') {
      let tradingHistory: tradingHistory = {
        district_code: elements[1],
        property_id: elements[2],
        property_name: elements[5] === '' ? undefined : elements[5],
        property_unit_number: elements[6] === '' ? undefined : elements[6],
        property_house_number: elements[7] === '' ? undefined : elements[7],
        property_street_name: elements[8] === '' ? undefined : elements[8],
        property_locality: elements[9] === '' ? undefined : elements[9],
        property_postcode: elements[10] === '' ? undefined : elements[10],
        area: elements[11] === '' ? undefined : elements[11],
        area_type: elements[12] === '' ? undefined : elements[12],
        contract_date: elements[13],
        settlement_date: elements[14],
        purchase_price: parseInt(elements[15]),
        zoning: elements[16] === '' ? undefined : elements[16],
        nature_of_property: elements[17] === '' ? undefined : elements[17],
        primary_purpose: elements[18] === '' ? undefined : elements[18],
        strata_lot_number: elements[19] === '' ? undefined : elements[19],
        conponent_code: elements[20] === '' ? undefined : elements[20],
        sale_code: elements[21] === '' ? undefined : elements[21],
        interest_of_sale: elements[22] === '' ? undefined : elements[22],
        dealing_number: elements[23],
        purchaser_count: 0,
        vendor_count: 0,
      };
      tradingHistories.push(tradingHistory);
    } else if (elements[0] === 'C') {
      if (
        tradingHistories[tradingHistories.length - 1].description === undefined
      ) {
        tradingHistories[tradingHistories.length - 1].description = elements[5];
      } else {
        tradingHistories[tradingHistories.length - 1].description +=
          elements[5];
      }
    } else if (elements[0] === 'D') {
      if (elements[5] === 'P') {
        tradingHistories[tradingHistories.length - 1].purchaser_count += 1;
      } else {
        tradingHistories[tradingHistories.length - 1].vendor_count += 1;
      }
    }
  }

  return tradingHistories;
}

if (process.env.NODE_ENV === 'test') {
  module.exports = { getAllDatFiles, parseDatFile };
}
