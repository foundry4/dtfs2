const loanValidationErrors = require('../validation/loan');

const loanStatus = (loan, loanErrors) => {
  if (!loanErrors || loanErrors.count === 0) {
    if (loan.issueFacilityDetailsProvided) {
      // this will either be 'Ready for checker' or 'Submitted'
      return loan.status;
    }

    // otherwise the facility has not been issued and there no validationErrors
    return 'Completed';
  }
  return 'Incomplete';
};

const addAccurateStatusesToLoans = (loanTransactions) => {
  if (loanTransactions.items.length) {
    loanTransactions.items.forEach((l) => {
      const loan = l;
      const validationErrors = loanValidationErrors(loan);
      loan.status = loanStatus(loan, validationErrors);
    });
  }
  return loanTransactions;
};

module.exports = {
  loanStatus,
  addAccurateStatusesToLoans,
};
