const moment = require('moment');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenorDate = require('../facilities/mapTenorDate');
const { convertDateToTimestamp } = require('../../../../utils/date');

const mapGefFacilityDates = (facilitySnapsot, facilityTfm, dealSnapshot) => {
  const {
    coverStartDate,
    coverEndDate,
    issuedFacilitySubmittedToUkefTimestamp,
    monthsOfCover: ukefGuaranteeInMonths,
    facilityStage,
  } = facilitySnapsot;

  const { exposurePeriodInMonths } = facilityTfm;

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealSnapshot;

  return {
    inclusionNoticeReceived: manualInclusionNoticeSubmissionDate || dealSubmissionDate,
    bankIssueNoticeReceived: issuedFacilitySubmittedToUkefTimestamp,
    coverStartDate: convertDateToTimestamp(coverStartDate),
    coverEndDate: mapCoverEndDate(
      moment(coverEndDate).format('DD'),
      moment(coverEndDate).format('MM'),
      moment(coverEndDate).format('YYYY'),
    ),
    tenor: mapTenorDate(
      facilityStage,
      ukefGuaranteeInMonths,
      exposurePeriodInMonths,
    ),
  };
};

module.exports = mapGefFacilityDates;
