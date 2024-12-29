import sqlAccess from '../src/sqlAccess';

test('SqlAccess', async () => {
  const db = new sqlAccess('/workspaces/AusPropertySales/test/test.db');
  await db.hold;
});
