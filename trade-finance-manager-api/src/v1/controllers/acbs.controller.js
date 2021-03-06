const moment = require('moment');
const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const { findOneBank } = require('./banks.controller');
const tfmController = require('./tfm.controller');
const isIssued = require('../helpers/is-issued');

const addToACBSLog = async ({
  deal = {}, facility = {}, bank = {}, acbsTaskLinks,
}) => {
  const collection = await db.getCollection('acbs-log');

  const acbsLog = await collection.insertOne({
    // eslint-disable-next-line no-underscore-dangle
    dealId: deal._id,
    deal,
    facility,
    bank,
    status: 'Running',
    instanceId: acbsTaskLinks.id,
    acbsTaskLinks,
    submittedDate: moment().format(),
  });

  return acbsLog;
};

const clearACBSLog = async () => {
  const collection = await db.getCollection('acbs-log');
  const removed = await collection.remove({});

  return removed;
};

const createACBS = async (deal) => {
  // Add bank's full details so we can reference partyUrn in function
  const bankId = deal.dealSnapshot.details.owningBank.id;

  const bank = await findOneBank(bankId);

  if (!bank) {
    return false;
  }

  const { id, name, partyUrn } = bank;

  const acbsTaskLinks = await api.createACBS(deal, { id, name, partyUrn });
  return addToACBSLog({ deal, bank, acbsTaskLinks });
};

const updateDealAcbs = async (taskOutput) => {
  const { facilities, ...dealAcbs } = taskOutput;
  await tfmController.updateAcbs(taskOutput.portalDealId, dealAcbs);
  const facilitiesUpdates = facilities.map((facility) => {
    const { facilityId, ...acbsFacility } = facility;
    return tfmController.updateFacilityAcbs(facilityId, acbsFacility);
  });
  await Promise.all(facilitiesUpdates);
};

const updateIssuedFacilityAcbs = ({ facilityId, issuedFacilityMaster }) =>
  tfmController.updateFacilityAcbs(facilityId, { issuedFacilityMaster });

const checkAzureAcbsFunction = async () => {
  // Fetch outstanding functions

  const collection = await db.getCollection('acbs-log');
  const runningTasks = await collection.find({ status: 'Running' }).toArray();

  const tasks = runningTasks.map(({ acbsTaskLinks = {} }) => api.getFunctionsAPI(acbsTaskLinks.statusQueryGetUri));
  const taskList = await Promise.all(tasks);

  taskList.forEach(async (task) => {
    // eslint-disable-next-line no-underscore-dangle
    // Update
    if (task.runtimeStatus !== 'Running') {
      await collection.findOneAndUpdate(
        { instanceId: task.instanceId },
        $.flatten({
          status: task.runtimeStatus,
          acbsTaskResult: task,
        }),
      );
    }

    if (task.runtimeStatus === 'Completed') {
      switch (task.name) {
        case 'acbs-issue-facility':
          await updateIssuedFacilityAcbs(task.output);
          break;

        default:
          await updateDealAcbs(task.output);
      }
    }
  });
};

const issueAcbsFacilities = async (deal) => {
  if (!deal.tfm || !deal.tfm.acbs) {
    // Hasn't been submitted to acbs yet so no need to do anything
    return false;
  }
  const tfmFacilities = await Promise.all(
    // eslint-disable-next-line no-underscore-dangle
    deal.dealSnapshot.facilities.map((facilityId) => api.findOneFacility(facilityId)),
  );

  const acbsIssuedFacilitiesPromises = tfmFacilities.filter((facility) => {
    // Only concerned with issued facilities on Portal that aren't issued on ACBS
    const facilityStageInAcbs = facility.tfm.acbs && facility.tfm.acbs.facilityStage;
    return !isIssued({ facilityStage: facilityStageInAcbs }) && isIssued(facility.facilitySnapshot);
  }).map((facility) => api.updateACBSfacility(facility, deal.dealSnapshot.submissionDetails['supplier-name']));

  const acbsIssuedFacilities = await Promise.all(acbsIssuedFacilitiesPromises);

  const acbsIssueFacilityTasks = await Promise.all(
    acbsIssuedFacilities.map((acbsTaskLinks) => addToACBSLog({ acbsTaskLinks })),
  );
  return acbsIssueFacilityTasks;
};

module.exports = {
  addToACBSLog,
  clearACBSLog,
  createACBS,
  checkAzureAcbsFunction,
  issueAcbsFacilities,
};
