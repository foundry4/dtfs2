const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const { hasAllIssuedDateValues } = require('../facility-dates/issued-date');
const { createTimestampFromSubmittedValues } = require('../facility-dates/timestamp');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const { hasValue } = require('../../utils/string');
const canIssueFacility = require('../facility-issuance');
const facilitiesController = require('./facilities.controller');

exports.updateLoanIssueFacility = async (req, res) => {
  const {
    loanId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        return res.status(401).send();
      }

      const loan = await facilitiesController.findOne(loanId);

      if (!loan) {
        return res.status(404).send();
      }

      if (!canIssueFacility(req.user.roles, deal, loan)) {
        return res.status(403).send();
      }

      let modifiedLoan = {
        ...loan,
        ...req.body,
      };

      // remove status added via type B XML. (we dynamically generate statuses)
      modifiedLoan.status = null;

      if (!modifiedLoan.issueFacilityDetailsStarted
        && !modifiedLoan.issueFacilityDetailsSubmitted) {
        // add a flag for UI/design/status/business handling...
        modifiedLoan.issueFacilityDetailsStarted = true;
      }

      const loanHasBankReferenceNumber = hasValue(loan.bankReferenceNumber);
      if (!loanHasBankReferenceNumber) {
        modifiedLoan.bankReferenceNumberRequiredForIssuance = true;
      }

      if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
        modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
      } else {
        modifiedLoan.requestedCoverStartDate = null;
      }

      if (hasAllIssuedDateValues(modifiedLoan)) {
        modifiedLoan.issuedDate = createTimestampFromSubmittedValues(req.body, 'issuedDate');
      } else {
        modifiedLoan.issuedDate = null;
      }

      const validationErrors = loanIssueFacilityValidationErrors(
        modifiedLoan,
        deal,
      );

      if (validationErrors.count === 0) {
        modifiedLoan.issueFacilityDetailsProvided = true;
      } else {
        modifiedLoan.issueFacilityDetailsProvided = false;
      }

      const { status, data } = await facilitiesController.update(loanId, modifiedLoan, req.user);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          loan: data,
        });
      }

      return res.status(status).send(data);
    }

    return res.status(404).send();
  });
};
