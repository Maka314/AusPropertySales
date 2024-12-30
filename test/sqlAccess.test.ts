import sqlAccess from '../src/sqlAccess';
import fs from 'fs';

test('SqlAccess', async () => {
  const testDir = '/workspaces/AusPropertySales/test/testFiles';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  const db = new sqlAccess(
    '/workspaces/AusPropertySales/test/testFiles/test.db'
  );

  await db.hold;
  await db.setupSchema();

  const AdmZip = require('adm-zip');
  const getAllDatFiles = require('../src/tradingHistoryParse').getAllDatFiles;
  const parseDatFile = require('../src/tradingHistoryParse').parseDatFile;
  const zip = new AdmZip(
    '/workspaces/AusPropertySales/test/testFiles/2023.zip'
  );

  const datFiles = getAllDatFiles(zip)[0];
  const parseRes = parseDatFile(datFiles);
  const record = parseRes[0];
  expect(record.property_id).toBe('5211');

  await db.insertTradingHistory(record);

  const dbPath = '/workspaces/AusPropertySales/test/testFiles/test.db';
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});
