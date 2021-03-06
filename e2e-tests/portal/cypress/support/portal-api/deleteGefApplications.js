const { listGefApplications, logIn, deleteGefApplication } = require('./api');

const deleteGefApplications = (token, deals) => {
  if (!deals || !deals.length) return;
  deals.forEach(async (deal) => deleteGefApplication(token, deal));
};

module.exports = (opts) => logIn(opts).then((token) => {
  listGefApplications(token).then(async (deals) => {
    await deleteGefApplications(token, deals);
  });
});
