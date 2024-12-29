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
  strata_lot_number?: number;
  conponent_code?: number;
  sale_code?: number;
  interest_of_sale?: number;
  property_legal_description?: string;
}

export async function downloadYearPack(year: number) {
  const url = yearDownloadBaseUrl + year + '.zip';
  const yearDatas = await axios.get(url, { responseType: 'arraybuffer' });
  const zip = new AdmZip(yearDatas.data);
  const zipEntries = zip.getEntries();
  zipEntries.forEach((entry) => {
    if (entry.isDirectory) {
      console.log('Directory: ' + entry.entryName);
    } else {
      console.log('File: ' + entry.entryName);
    }
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

if (process.env.NODE_ENV === 'test') {
  module.exports = { getAllDatFiles };
}
