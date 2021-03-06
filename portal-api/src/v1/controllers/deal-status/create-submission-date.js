const { updateDeal } = require('../deal.controller');
const now = require('../../../now');

const createSubmissionDate = async (dealId, user) => {
  const modifiedDeal = {
    details: {
      submissionDate: now(),
      checker: user,
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
    user,
  );

  return updatedDeal;
};

module.exports = createSubmissionDate;
