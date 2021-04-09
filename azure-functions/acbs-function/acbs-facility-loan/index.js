/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 *
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *    function app in Kudu
 */

const df = require('durable-functions');
const mappings = require('../mappings');
const CONSTANTS = require('../constants');

module.exports = df.orchestrator(function* createACBSfacilityBond(context) {
  const firstRetryIntervalInMilliseconds = 5000;
  const maxNumberOfAttempts = 3;

  const retryOptions = new df.RetryOptions(firstRetryIntervalInMilliseconds, maxNumberOfAttempts);

  const {
    deal, facility, acbsData,
  } = context.df.getInput();

  // EWCS route
  // Create Guarantee (Facility Provider)
  const acbsFacilityProviderGuaranteeInput = mappings.facility.facilityGuarantee(
    deal,
    facility,
    { acbsData },
    CONSTANTS.FACILITY.GUARANTEE_TYPE.FACILITY_PROVIDER,
  );
  const acbsFacilityBuyerGuaranteeInput = mappings.facility.facilityGuarantee(
    deal,
    facility,
    { acbsData },
    CONSTANTS.FACILITY.GUARANTEE_TYPE.BUYER_FOR_EXPORTER_EWCS,
  );

  const facilityProviderTask = context.df.callActivity(
    'create-facility-guarantee',
    { acbsFacilityGuaranteeInput: acbsFacilityProviderGuaranteeInput },
    retryOptions,
  );

  const facilityBuyerTask = context.df.callActivity(
    'create-facility-guarantee',
    { acbsFacilityGuaranteeInput: acbsFacilityBuyerGuaranteeInput },
    retryOptions,
  );
  yield context.df.Task.all([facilityProviderTask, facilityBuyerTask]);

  return {
    facilityProviderGuarantee: facilityProviderTask.result,
    facilityBuyerGuarantee: facilityBuyerTask.result,
  };
});
