const { updatePortalDealStatus } = require('./api');

module.exports = (dealId, status) => {
  console.log('updatePortalDealStatus', { dealId, status });
  new Cypress.Promise((resolve) => {
    updatePortalDealStatus(dealId, status);
    resolve();
  });
};
