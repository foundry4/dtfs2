const api = require('../api');
const convertFacilityCurrency = require('./convert-facility-currency');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');

const updateFacilities = async (deal) => {
  const modifiedDeal = deal;

  const {
    submissionDate: dealSubmissionDate,
  } = deal.dealSnapshot.details;

  const facilities = [
    ...modifiedDeal.dealSnapshot.bondTransactions.items,
    ...modifiedDeal.dealSnapshot.loanTransactions.items,
  ];

  const bonds = [];
  const loans = [];

  let updatedCount = 0;

  return new Promise((resolve) => {
    facilities.forEach(async (facility) => {
      const {
        _id: facilityId,
        facilityType,
      } = facility;

      const facilityCurrencyConversion = await convertFacilityCurrency(facility, dealSubmissionDate);
      const facilityExposurePeriod = await getFacilityExposurePeriod(facility);
      const facilityPremiumSchedule = await getFacilityPremiumSchedule(facility, facilityExposurePeriod);

      const premiumSchedule = {
        premiumSchedule: facilityPremiumSchedule,
      };
      const facilityUpdate = {
        ...facilityCurrencyConversion,
        ...facilityExposurePeriod,
        ...premiumSchedule,
      };

      const updatedFacility = await api.updateFacility(facilityId, facilityUpdate);
      console.log(`facilityPremiumSchedule:${JSON.stringify(facilityPremiumSchedule)}`);
      console.log(`facilityUpdate:${JSON.stringify(facilityUpdate)}`);
      console.log(`updatedFacility:${JSON.stringify(updatedFacility)}`);


      updatedCount += 1;

      // update deal object to return in response
      if (facilityType === 'bond') {
        bonds.push(updatedFacility);
      } else if (facilityType === 'loan') {
        loans.push(updatedFacility);
      }

      if (updatedCount === facilities.length) {
        modifiedDeal.dealSnapshot.bondTransactions.items = bonds;
        modifiedDeal.dealSnapshot.loanTransactions.items = loans;

        return resolve(modifiedDeal);
      }
      return modifiedDeal;
    });
  });
};


exports.updateFacilities = updateFacilities;
