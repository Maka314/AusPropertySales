import sqlAccess from '../src/sqlAccess';
import fs from 'fs';

test('SqlAccess', async () => {
  const testDir = '/workspaces/AusPropertySales/test/testFiles';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  const db = new sqlAccess('/workspaces/AusPropertySales/test/testFiles/test.db');

  await db.hold;
  await db.setupSchema();
});
