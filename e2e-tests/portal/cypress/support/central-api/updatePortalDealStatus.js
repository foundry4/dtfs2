const { updatePortalDealStatus } = require('./api');

module.exports = (dealId, status) => {
  new Cypress.Promise((resolve) => {
    updatePortalDealStatus(dealId, status);
    resolve();
  });
};
