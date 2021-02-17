const mapTotals = require('./mappings/mapTotals');
const mapFacilities = require('./mappings/facilities/mapFacilities');
const mapSubmissionDetails = require('./mapSubmissionDetails');

// TODO: add unit test
// so that when this is changed, tests fail.

const dealReducer = (deal) => {
  const { tfm, dealSnapshot } = deal;

  const {
    details,
    submissionDetails,
    facilities,
    eligibility,
  } = dealSnapshot;

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    dealSnapshot: {
      ...dealSnapshot,
      totals: mapTotals(facilities),
      facilities: mapFacilities(facilities, details),
      submissionDetails: mapSubmissionDetails(submissionDetails),
      eligibilityCriteria: eligibility.criteria,
    },
    tfm,
  };
  return result;
};

module.exports = dealReducer;
