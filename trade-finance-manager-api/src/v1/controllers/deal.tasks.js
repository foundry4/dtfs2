const api = require('../api');
const CONSTANTS = require('../../constants');
const DEFAULTS = require('../defaults');

const createDealTasks = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    tfm,
    dealSnapshot,
  } = deal;

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    details,
  } = dealSnapshot;

  const {
    submissionType,
  } = details;

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    const dealUpdate = {
      tfm: {
        ...tfm,
        tasks: DEFAULTS.TASKS.AIN,
      },
    };

    const updatedDeal = await api.updateDeal(dealId, dealUpdate);

    return updatedDeal;
  }

  return deal;
};

exports.createDealTasks = createDealTasks;