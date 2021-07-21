const { updatePortalFacilityStatus } = require('./api');

module.exports = (facilityId, status) => {
  console.log('updatePortalFacilityStatus', { facilityId, status });
  new Cypress.Promise((resolve) => {
    updatePortalFacilityStatus(facilityId, status);
    resolve();
  });
};
