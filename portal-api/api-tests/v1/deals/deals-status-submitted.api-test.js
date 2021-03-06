const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const createFacilities = require('../../createFacilities');
const api = require('../../../src/v1/api')

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

// jest.unmock('@azure/storage-file-share');

describe('PUT /v1/deals/:id/status - status changes to `Submitted`', () => {
  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aBarclaysMakerChecker;
  let aSuperuser;
  let tfmMaker;
  let tfmChecker;
  const originalFacilities = completedDeal.mockFacilities;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    anotherBarclaysMaker = barclaysMakers[1];
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();

    const barclaysMakerChecker = testUsers().withMultipleRoles('maker', 'checker').withBankName('Barclays Bank').one();
    aBarclaysMakerChecker = barclaysMakerChecker;
    aSuperuser = testUsers().superuser().one();

    tfmMaker = testUsers().withRole('maker').withBankName('UKEF test bank (Delegated)').one();
    tfmChecker = testUsers().withRole('checker').withBankName('UKEF test bank (Delegated)').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);      
    api.tfmDealSubmit = () => Promise.resolve();
  });

  describe('when the status changes to `Submitted`', () => {
    it('adds a submissionDate to the deal', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      // TODO - since we are running inside the same VM as the service during these tests..
      //  we -can- mock the system clock and do accurate assertions here..
      // feels more unit-test-like but something to think about
      expect(body.deal.details.submissionDate).toBeDefined();
    });

    it('does NOT add a submissionDate to the deal when one already exists', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      // add a mock 'timestamp'/value that we can test against
      const mockSubmissionDate = '123456';
      submittedDeal.details.submissionDate = mockSubmissionDate;

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.details.submissionDate).toEqual(mockSubmissionDate);
    });

    it('increases submissionCount on each submission', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      // first submit
      const submitDealCall = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(submitDealCall.status).toEqual(200);
      expect(submitDealCall.body).toBeDefined();

      const dealAfterFirstSubmission = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      expect(dealAfterFirstSubmission.body.deal.details.submissionCount).toEqual(1);

      // second submit 
      const submitDealCallAgain = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(submitDealCallAgain.status).toEqual(200);
      expect(submitDealCallAgain.body).toBeDefined();

      const dealAfterSecondSubmission = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      expect(dealAfterSecondSubmission.body.deal.details.submissionCount).toEqual(2);
    });

    it('creates type_a xml if deal successfully submitted', async () => {
      const files = [
        {
          filename: 'test-file-1.txt',
          filepath: 'api-tests/fixtures/test-file-1.txt',
          fieldname: 'exporterQuestionnaire',
          type: 'general_correspondence',
        },
        {
          filename: 'test-file-2.txt',
          filepath: 'api-tests/fixtures/test-file-2.txt',
          fieldname: 'exporterQuestionnaire',
          type: 'general_correspondence',
        },
        {
          filename: 'test-file-3.txt',
          filepath: 'api-tests/fixtures/test-file-3.txt',
          fieldname: 'auditedFinancialStatements',
          type: 'financials',
        },
      ];

      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;

      // Upload supporting docs
      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${createdDeal._id}/eligibility-documentation`);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toBeDefined();
    });
  });

  describe('when the status changes to `Submitted` by a TFM enabled checker/bank', () => {
    it('should add UKEF ids to deal and facilities', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      const postResult = await as(tfmMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;
     
      await createFacilities(tfmMaker, dealId, completedDeal.mockFacilities);

      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(tfmChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.details.ukefDealId).toBeDefined();
      expect(typeof body.deal.details.ukefDealId).toEqual('string');

      body.deal.bondTransactions.items.forEach((bond) => {
        expect(bond.ukefFacilityID).toBeDefined();
        expect(typeof bond.ukefFacilityID).toEqual('string');
      });

      body.deal.loanTransactions.items.forEach((loan) => {
        expect(loan.ukefFacilityID).toBeDefined();
        expect(typeof loan.ukefFacilityID).toEqual('string');
      });
    });

    describe('when the deal has already been submitted', () => {
      it('should NOT add/change the deal and facilities UKEF ids', async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(tfmMaker).post(submittedDeal).to('/v1/deals');
        const dealId = postResult.body._id;

        await createFacilities(tfmMaker, dealId, completedDeal.mockFacilities);

        const createdDeal = postResult.body;

        // first submit
        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        const dealAfterFirstSubmission = await as(tfmChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

        // second submit
        await as(tfmChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

        const dealAfterSecondSubmission = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

        expect(dealAfterSecondSubmission.body.deal.details.ukefDealId).toEqual(dealAfterFirstSubmission.body.details.ukefDealId);

        dealAfterSecondSubmission.body.deal.bondTransactions.items.forEach((bond) => {
          const bondInFirstSubmission = dealAfterFirstSubmission.body.bondTransactions.items.find((b) => 
            b._id === bond._id);

          expect(bond.ukefFacilityID).toEqual(bondInFirstSubmission.ukefFacilityID);
        });

        dealAfterSecondSubmission.body.deal.loanTransactions.items.forEach((loan) => {
          const loanInFirstSubmission = dealAfterFirstSubmission.body.loanTransactions.items.find((l) =>
            l._id === loan._id);

          expect(loan.ukefFacilityID).toEqual(loanInFirstSubmission.ukefFacilityID);
        });

      });
    });
  });

  describe('when the status changes to `Submitted` on invalid deal', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const createdDeal = postResult.body;

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorCount).toBeGreaterThan(0);
      expect(updatedDeal.body.errorCount).toEqual(updatedDeal.body.errorList.length);
    });
  });

  describe('when the status changes to `Submitted` on a deal that has bond facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;
 
      const modifiedMockFacilities = originalFacilities;
      const firstBond = modifiedMockFacilities.find((f) => f.facilityType === 'bond');

      firstBond.status = 'Ready for check';
      firstBond.requestedCoverStartDate = moment().subtract(1, 'day').utc().valueOf();

      await createFacilities(tfmMaker, dealId, [firstBond]);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual('Requested Cover Start Date must be today or in the future');
    });
  });
  
  describe('when the status changes to `Submitted` on a deal that has loan facilities with `ready for check` status and cover start dates that are in the past', () => {
    it('return validation errors', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

      submittedDeal.details.previousWorkflowStatus = 'invalid status';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const modifiedMockFacilities = originalFacilities;
      const firstLoan = modifiedMockFacilities.find((f) => f.facilityType === 'loan');

      firstLoan.status = 'Ready for check';
      firstLoan.requestedCoverStartDate = moment().subtract(1, 'day').utc().valueOf();

      await createFacilities(tfmMaker, dealId, [firstLoan]);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body.errorList.requestedCoverStartDate.text).toEqual('Requested Cover Start Date must be today or in the future');
    });
  });

  describe('when the MIA deal status changes to `Submitted`', () => {
    it('adds an MIA submissionDate to the deal', async () => {
      const submittedDeal = JSON.parse(JSON.stringify(completedDeal));
      submittedDeal.details.submissionType = 'Manual Inclusion Application';

      const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

      const dealId = postResult.body._id;

      const mockFacilites = [
        {
          ...completedDeal.mockFacilities[0],
          requestedCoverStartDate: moment().utc().valueOf(),
        },
      ];

      await createFacilities(tfmMaker, dealId, mockFacilites);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.status).toEqual(200);
      expect(updatedDeal.body).toBeDefined();

      const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

      // TODO - since we are running inside the same VM as the service during these tests..
      //  we -can- mock the system clock and do accurate assertions here..
      // feels more unit-test-like but something to think about
      expect(body.deal.details.submissionDate).toBeDefined();
      expect(body.deal.details.manualInclusionApplicationSubmissionDate).toBeDefined();
    });
  });

  describe('when the status changes to `Ready for Checker\'s approval` on approved MIA', () => {
    it('should add the makers details as MIN maker', async () => {
      const dealCreatedByMaker = {
        ...completedDeal,
        details: {
          ...completedDeal.details,
          submissionType: 'Manual Inclusion Application',
          previousWorkflowStatus: 'approved',
        },
      };

      const postResult = await as(aBarclaysMaker).post(dealCreatedByMaker).to('/v1/deals');
      const dealId = postResult.body._id;

      await createFacilities(tfmMaker, dealId, completedDeal.mockFacilities);

      const statusUpdate = {
        status: 'Ready for Checker\'s approval',
        comments: 'Yay!',
      };

      const updatedDeal = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(updatedDeal.body.details.makerMIN.username).toEqual(aBarclaysMaker.username);
    });
  });

  describe('when the status changes to `Submitted` on approved MIA', () => {
    it('should add MIN submissionDate and checkers details as MIN checker', async () => {
      const dealCreatedByMaker = JSON.parse(JSON.stringify({
        ...completedDeal,
        details: {
          ...completedDeal.details,
          maker: tfmMaker,
          submissionType: 'Manual Inclusion Application',
          previousWorkflowStatus: 'approved',
        },
      }));

      const postResult = await as(tfmMaker).post(dealCreatedByMaker).to('/v1/deals');
      const dealId = postResult.body._id;

      const mockFacilites = [
        {
          ...completedDeal.mockFacilities[0],
          requestedCoverStartDate: moment().utc().valueOf(),
        },
      ];

      await createFacilities(tfmMaker, dealId, mockFacilites);

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      const { body, status } = await as(tfmChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

      expect(status).toEqual(200);

      expect(body.details.manualInclusionNoticeSubmissionDate).toBeDefined();
      expect(body.details.checkerMIN.username).toEqual(tfmChecker.username);
    });
  });
});
