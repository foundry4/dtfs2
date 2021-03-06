
const db = require('./src/drivers/db-client');

const mockFiles = [];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

console.log(`MOCKED FILES: \n${mockFiles.join('\n')}`);

afterAll(async () => {
  await db.close();
});
