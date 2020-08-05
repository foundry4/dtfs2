const bondValidationErrors = require('../validation/bond');

const bondStatus = (bond, bondErrors) => {
  if (!bondErrors || bondErrors.count === 0) {
    if (bond.issueFacilityDetailsProvided) {
      // this will either be 'Ready for checker' or 'Submitted'
      return bond.status;
    }

    // otherwise the facility has not been issued and there no validationErrors
    return 'Completed';
  }
  return 'Incomplete';
};

const addAccurateStatusesToBonds = (bondTransactions) => {
  if (bondTransactions.items.length) {
    bondTransactions.items.forEach((b) => {
      const bond = b;
      const validationErrors = bondValidationErrors(bond);
      bond.status = bondStatus(bond, validationErrors);
    });
  }
  return bondTransactions;
};

module.exports = {
  bondStatus,
  addAccurateStatusesToBonds,
};
