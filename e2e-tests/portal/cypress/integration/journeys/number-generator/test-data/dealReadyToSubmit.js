const moment = require('moment');
const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');

module.exports = () => {
  const now = moment();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const deal = JSON.parse(JSON.stringify(dealThatJustNeedsConversionDate()));

  deal.submissionDetails['supplyContractConversionDate-day'] = `${now.format('DD')}`;
  deal.submissionDetails['supplyContractConversionDate-month'] = `${now.format('MM')}`;
  deal.submissionDetails['supplyContractConversionDate-year'] = `${now.format('YYYY')}`;

  const loan = deal.mockFacilities.find((f) => f.facilityType === 'loan');
  loan.requestedCoverStartDate = moment().utc().valueOf();

  const aMonthInTheFuture = moment().add(1, 'month');
  loan['coverEndDate-day'] = aMonthInTheFuture.format('DD');
  loan['coverEndDate-month'] = aMonthInTheFuture.format('MM');
  loan['coverEndDate-year'] = moment(aMonthInTheFuture).format('YYYY');
  return deal;
};
