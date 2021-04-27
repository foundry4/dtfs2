const api = require('../api');
const CONSTANTS = require('../../constants');

const updatePortalDealStatus = async (dealId, submissionType) => {
  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    await api.updatePortalDealStatus(
      dealId,
      CONSTANTS.DEALS.DEAL_STATUS_PORTAL.SUBMISSION_ACKNOWLEDGED,
    );
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    await api.updatePortalDealStatus(
      dealId,
      CONSTANTS.DEALS.DEAL_STATUS_PORTAL.SUBMISSION_ACKNOWLEDGED,
    );

    await api.updatePortalDealStatus(
      dealId,
      CONSTANTS.DEALS.DEAL_STATUS_PORTAL.IN_PROGRESS,
    );
  }

  return null;
};

exports.updatePortalDealStatus = updatePortalDealStatus;