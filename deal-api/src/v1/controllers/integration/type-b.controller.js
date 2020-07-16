
const xml2js = require('xml2js');
const dealController = require('../deal.controller');

const { generateStatus } = require('./type-b-helpers');

const processTypeB = async ({ fileContents }) => {
  const { Deal: workflowDeal, error } = await xml2js.parseStringPromise(fileContents /* , options */)
    .catch((err) => ({ error: err.message }));

  if (error) {
    return {
      error,
    };
  }


  const { portal_deal_id: dealId } = workflowDeal.$;

  const deal = await dealController.findOneDeal(dealId);
  if (!deal) {
    return false;
  }

  //  const comments = generateComments();

  const updatedDealInfo = {
    details: {
      status: generateStatus(deal, workflowDeal),
      ukefDealId: workflowDeal.UKEF_deal_id[0],
    },
  };

  const updateRequest = {
    params: {
      id: dealId,
    },
    body: updatedDealInfo,
  };

  const updatedDeal = await dealController.updateDeal(updateRequest);
  return updatedDeal;
};

module.exports = {
  processTypeB,
};
