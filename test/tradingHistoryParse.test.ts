import AdmZip from 'adm-zip';

test('yearDownloadBaseUrl should be correct', () => {
  const yearDownloadBaseUrl =
    'https://www.valuergeneral.nsw.gov.au/__psi/yearly/';
  const year = 2021;
  const url = yearDownloadBaseUrl + year + '.zip';
  expect(url).toBe(
    'https://www.valuergeneral.nsw.gov.au/__psi/yearly/2021.zip'
  );
});

test('getAllDatFiles should be mocked', () => {
  const getAllDatFiles = require('../src/tradingHistoryParse').getAllDatFiles;
  const zip = new AdmZip(
    '/workspaces/AusPropertySales/test/testFiles/2023.zip'
  );
  const datFiles = getAllDatFiles(zip);
  expect(datFiles.length).toBe(6374);
});

test('parseDatFile', () => {
  const getAllDatFiles = require('../src/tradingHistoryParse').getAllDatFiles;
  const parseDatFile = require('../src/tradingHistoryParse').parseDatFile;
  const zip = new AdmZip(
    '/workspaces/AusPropertySales/test/testFiles/2023.zip'
  );

  const datFiles = getAllDatFiles(zip)[0];
  const parseRes = parseDatFile(datFiles);
  expect(parseRes.length).toBe(7);
});
