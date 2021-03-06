const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed-issued-and-unissued-facilities');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');
const { updateDeal } = require('../../../src/v1/controllers/deal.controller');
const createFacilities = require('../../createFacilities');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

// jest.unmock('@azure/storage-file-share');

describe('/v1/deals/:id/status - facilities', () => {
  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aBarclaysMakerChecker;
  let aSuperuser;
  const originalFacilities = completedDeal.mockFacilities;

  const isUnsubmittedIssuedFacility = (facility) => {
    if ((facility.facilityStage === 'Unissued' || facility.facilityStage === 'Conditional')
      && facility.issueFacilityDetailsProvided
      && !facility.issueFacilityDetailsSubmitted
      && facility.status !== 'Submitted') {
      return facility;
    }
    return null;
  };

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);

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
  });

  describe('PUT /v1/deals/:id/status', () => {
    describe('when the status changes from `Further Maker\'s input required` to `Ready for Checker\'s approval`', () => {
      let createdDeal;
      let updatedDeal;
      let dealId;
      let createdFacilities;

      beforeEach(async (done) => {
        completedDeal.status = 'Further Maker\'s input required';
        completedDeal.details.submissionDate = moment().utc().valueOf();

        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;
        dealId = createdDeal._id;

        createdFacilities = await createFacilities(aBarclaysMaker, dealId, originalFacilities);

        if (createdFacilities.length) {
          completedDeal.mockFacilities = createdFacilities;

          const statusUpdate = {
            status: 'Ready for Checker\'s approval',
          };

          updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

          done();
        }
      });

      describe('any issued bonds that have details provided, but not yet been submitted', () => {
        it('should add `Ready for check` status, change facilityStage from `Unissued` to `Issued`, add previousFacilityStage', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = body.deal.bondTransactions.items.filter((b) =>
            b.facilityStage === 'Unissued'
            && b.issueFacilityDetailsProvided === true
            && !b.issueFacilityDetailsSubmitted);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            expect(bond.status).toEqual('Ready for check');
            expect(bond.facilityStage).toEqual('Issued');
            expect(bond.previousFacilityStage).toEqual('Unissued');
            expect(typeof bond.lastEdited).toEqual('string');
          });

          const issuedLoansThatShouldBeUpdated = body.deal.loanTransactions.items.filter((l) =>
            l.facilityStage === 'Conditional'
            && l.issueFacilityDetailsProvided === true
            && !l.issueFacilityDetailsSubmitted);

          issuedLoansThatShouldBeUpdated.forEach((loan) => {
            expect(loan.status).toEqual('Ready for check');
            expect(loan.facilityStage).toEqual('Unconditional');
            expect(loan.previousFacilityStage).toEqual('Conditional');
            expect(typeof loan.lastEdited).toEqual('string');
          });

        });
      });

      describe('any issued loans that have details provided, but not yet been submitted', () => {
        it('should add `Ready for check` status, change facilityStage from `Conditional` to `Unconditional`, add previousFacilityStage', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);


          const issuedLoansThatShouldBeUpdated = body.deal.loanTransactions.items.filter((l) =>
            l.facilityStage === 'Conditional'
            && l.issueFacilityDetailsProvided === true
            && !l.issueFacilityDetailsSubmitted);

          issuedLoansThatShouldBeUpdated.forEach((loan) => {
            const theLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(theLoan.status).toEqual('Ready for check');
            expect(theLoan.facilityStage).toEqual('Unconditional');
            expect(theLoan.previousFacilityStage).toEqual('Conditional');
            expect(typeof theLoan.lastEdited).toEqual('string');
          });
        });
      });

      describe('when a deal is AIN', () => {
        let ainDeal;

        beforeEach(async () => {
          ainDeal = completedDeal;
          ainDeal.details.submissionType = 'Automatic Inclusion Notice';

          const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(completedDeal))).to('/v1/deals');

          ainDeal = postResult;
        });
        
        describe('any issued bonds that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(ainDeal.status).toEqual(200);
            expect(ainDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'bond'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some bonds to test against
            expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

            issuedBondsThatShouldBeUpdated.forEach((bond) => {
              const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
              expect(updatedBond.requestedCoverStartDate).toEqual(bond.issuedDate);
              expect(typeof updatedBond.lastEdited).toEqual('string');
            });
          });
        });

        describe('any issued loans that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(ainDeal.status).toEqual(200);
            expect(ainDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'loan'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some loans to test against
            expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

            issuedLoansThatShouldBeUpdated.forEach((loan) => {
              const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
              expect(updatedLoan.requestedCoverStartDate).toEqual(loan.issuedDate);
              expect(typeof updatedLoan.lastEdited).toEqual('string');
            });
          });
        });
      });

      describe('when a deal is MIN', () => {
        describe('any issued bonds that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'bond'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some bonds to test against
            expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

            issuedBondsThatShouldBeUpdated.forEach((bond) => {
              const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
              expect(updatedBond.requestedCoverStartDate).toEqual(bond.issuedDate);
              expect(typeof updatedBond.lastEdited).toEqual('string');
            });
          });
        });

        describe('any issued loans that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'loan'
              &&  isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some loans to test against
            expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

            issuedLoansThatShouldBeUpdated.forEach((loan) => {
              const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
              expect(updatedLoan.requestedCoverStartDate).toEqual(loan.issuedDate);
              expect(typeof updatedLoan.lastEdited).toEqual('string');
            });
          });
        });
      });
    });

    describe('when the status changes to `Ready for Checker\'s approval`', () => {
      describe('when a deal is MIA and has been approved', () => {
        let createdDeal;
        let updatedDeal;

        beforeEach(async (done) => {
          completedDeal.status = 'Accepted by UKEF (without conditions)';
          completedDeal.details.submissionType = 'Manual Inclusion Application';
          completedDeal.details.approvalDate = moment().utc().valueOf().toString();

          const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

          const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

          createdDeal = postResult.body;
          dealId = createdDeal._id;

          const createdFacilities = await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

          if (createdFacilities.length) {
            completedDeal.mockFacilities = createdFacilities;

            const statusUpdate = {
              status: 'Ready for Checker\'s approval',
              comments: 'Nope',
            };

            updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);

            done();
          }
        });

        describe('any issued bonds that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to today if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'bond'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some bonds to test against
            expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

            issuedBondsThatShouldBeUpdated.forEach((bond) => {
              const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
              expect(typeof updatedBond.requestedCoverStartDate).toEqual('string');
              expect(typeof updatedBond.lastEdited).toEqual('string');
            });
          });
        });

        describe('any issued loans that have details provided, but not yet been submitted', () => {
          it('defaults requestedCoverStartDate to the issuedDate if no requestedCoverStartDate', async () => {
            expect(updatedDeal.status).toEqual(200);
            expect(updatedDeal.body).toBeDefined();

            const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

            const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
              f.facilityType === 'loan'
              && isUnsubmittedIssuedFacility(f)
              && !f.requestedCoverStartDate);

            // make sure we have some loans to test against
            expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

            issuedLoansThatShouldBeUpdated.forEach((loan) => {
              const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
              expect(typeof updatedLoan.requestedCoverStartDate).toEqual('string');
              expect(typeof updatedLoan.lastEdited).toEqual('string');
            });
          });
        });
      });
    });

    describe('when the status changes to `Further Maker\'s input required`', () => {
      let createdDeal;
      let updatedDeal;

      beforeEach(async (done) => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;

        dealId = createdDeal._id;

        const createdFacilities = await createFacilities(aBarclaysMaker, dealId, completedDeal.mockFacilities);

        if (createdFacilities.length) {
          completedDeal.mockFacilities = createdFacilities;

          const statusUpdate = {
            status: 'Further Maker\'s input required',
            comments: 'Nope',
          };

          updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

          done();
        }
      });

      const isIssuedFacilityWithFacilityStageChange = (facility) => {
        const issuedBond = (facility.facilityStage === 'Issued' && facility.previousFacilityStage === 'Unissued');
        const issuedLoan = (facility.facilityStage === 'Unconditional' && facility.previousFacilityStage === 'Conditional');

        if ((issuedBond || issuedLoan)
          && facility.issueFacilityDetailsProvided
          && !facility.issueFacilityDetailsSubmitted) {
          return facility;
        }
        return null;
      };

      describe('all issued bonds (facilityStage=`Issued`, previousFacilityStage=`Unissued`)', () => {
        it('should add `Maker’s input required` status to the bond', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'bond'
            && isIssuedFacilityWithFacilityStageChange(f));

          // make sure we have some bonds to test against
          expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
            expect(updatedBond.status).toEqual('Maker\'s input required');
            expect(typeof updatedBond.lastEdited).toEqual('string');
          });
        });
      });

      describe('any issued loans (facilityStage=`Unconditional`, previousFacilityStage=`Conditional`)', () => {
        it('should add `Maker’s input required` status to the loan', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'loan'
            && isIssuedFacilityWithFacilityStageChange(f));

          // make sure we have some loans to test against
          expect(issuedLoansThatShouldBeUpdated.length > 0).toEqual(true);

          issuedLoansThatShouldBeUpdated.forEach((loan) => {
            const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(updatedLoan.status).toEqual('Maker\'s input required');
            expect(typeof updatedLoan.lastEdited).toEqual('string');
          });
        });
      });
    });

    describe('when the deal status changes from `Draft` to `Ready for Checker\'s approval`', () => {
      let createdDeal;
      let updatedDeal;

      const statusUpdate = {
        comments: 'Ready to go!',
        status: 'Ready for Checker\'s approval',
      };

      const coverEndDate = () => ({
        'coverEndDate-day': moment().add(1, 'month').format('DD'),
        'coverEndDate-month': moment().add(1, 'month').format('MM'),
        'coverEndDate-year': moment().add(1, 'month').format('YYYY'),
      });

      const baseBond = {
        facilityType: 'bond',
        bondIssuer: 'issuer',
        bondType: 'bond type',
        bondBeneficiary: 'test',
        facilityValue: '123',
        currencySameAsSupplyContractCurrency: 'true',
        riskMarginFee: '1',
        coveredPercentage: '2',
        feeType: 'test',
        feeFrequency: 'test',
        dayCountBasis: 'test',
        currency: { id: 'EUR', text: 'Euros' },
      };

      const issuedBondFields = () => ({
        facilityStage: 'Issued',
        uniqueIdentificationNumber: '1234',
        ...coverEndDate(),
      });

      const newBonds = [
        {
          ...baseBond,
          facilityStage: 'Unissued',
          ukefGuaranteeInMonths: '24',
        },
        {
          ...baseBond,
          ...issuedBondFields(),
        },
        {
          ...baseBond,
          ...issuedBondFields(),
        },
      ];

      const conditionalLoan = () => ({
        facilityType: 'loan',
        facilityStage: 'Conditional',
        ukefGuaranteeInMonths: '12',
        facilityValue: '100',
        currencySameAsSupplyContractCurrency: 'true',
        interestMarginFee: '10',
        coveredPercentage: '40',
        premiumType: 'At maturity',
        dayCountBasis: '365',
        currency: { id: 'EUR', text: 'Euros' },
      });

      const unconditionalLoan = () => ({
        facilityType: 'loan',
        facilityStage: 'Unconditional',
        facilityValue: '100',
        bankReferenceNumber: '1234',
        ...coverEndDate(),
        disbursementAmount: '5',
        currencySameAsSupplyContractCurrency: 'true',
        interestMarginFee: '10',
        coveredPercentage: '40',
        premiumType: 'At maturity',
        dayCountBasis: '365',
        currency: { id: 'EUR', text: 'Euros' },
      });

      const newLoans = [
        conditionalLoan(),
        unconditionalLoan(),
        unconditionalLoan(),
      ];

      const newFacilities = [
        ...newBonds,
        ...newLoans,
      ];

      beforeEach(async (done) => {
        const dealInDraftStatus = completedDeal;
        dealInDraftStatus.details.status = 'Draft';

        const deal = JSON.parse(JSON.stringify(dealInDraftStatus));

        const postResult = await as(aBarclaysMaker).post(deal).to('/v1/deals');

        createdDeal = postResult.body;

        dealId = createdDeal._id;

        const createdFacilities = await createFacilities(aBarclaysMaker, dealId, newFacilities);

        if (createdFacilities.length) {
          completedDeal.mockFacilities = createdFacilities;

          updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

          done();
        }
      });

      describe('when a deal contains bonds with an `Issued` facilityStage that do NOT have a requestedCoverStartDate', () => {
        it('should add todays date to such bonds', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

          expect(body.deal.bondTransactions.items[0]).toEqual({
            ...newBonds[0],
            status: 'Completed',
            lastEdited: expect.any(String),
            createdDate: expect.any(String),
            requestedCoverStartDate: expect.any(String),
            _id: expect.any(String),
            associatedDealId: dealId,
          });

          expect(body.deal.bondTransactions.items[1]).toEqual({
            ...newBonds[1],
            status: 'Completed',
            lastEdited: expect.any(String),
            createdDate: expect.any(String),
            requestedCoverStartDate: expect.any(String),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            associatedDealId: dealId,
          });

          expect(body.deal.bondTransactions.items[2]).toEqual({
            ...newBonds[2],
            status: 'Completed',
            lastEdited: expect.any(String),
            createdDate: expect.any(String),
            requestedCoverStartDate: expect.any(String),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            associatedDealId: dealId,
          });
        });
      });

      describe('when a deal contains loans with an `Unconditional` facilityStage that do NOT have a requestedCoverStartDate', () => {
        it('should add todays date to such loans', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);

          expect(body.deal.loanTransactions.items[1]).toEqual({
            ...newLoans[1],
            status: 'Completed',
            lastEdited: expect.any(String),
            createdDate: expect.any(String),
            requestedCoverStartDate: expect.any(String),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            associatedDealId: dealId,
          });

          expect(body.deal.loanTransactions.items[2]).toEqual({
            ...newLoans[2],
            status: 'Completed',
            lastEdited: expect.any(String),
            createdDate: expect.any(String),
            requestedCoverStartDate: expect.any(String),
            'requestedCoverStartDate-day': expect.any(Number),
            'requestedCoverStartDate-month': expect.any(Number),
            'requestedCoverStartDate-year': expect.any(Number),
            _id: expect.any(String),
            associatedDealId: dealId,
          });
        });
      });
    });

    describe('when the status changes to `Submitted`', () => {
      let createdDeal;
      let updatedDeal;
      let expectedFacilitiesSubmittedBy;

      beforeEach(async (done) => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;

        dealId = createdDeal._id;

        const createdFacilities = await createFacilities(aBarclaysMaker, dealId, originalFacilities);

        if (createdFacilities.length) {
          completedDeal.mockFacilities = createdFacilities;

          const statusUpdate = {
            status: 'Submitted',
            confirmSubmit: true,
          };

          updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

          expectedFacilitiesSubmittedBy = aBarclaysChecker;

          done();
        }
      });

      const isUnsubmittedFacilityWithIssueFacilityDetailsProvided = (facility) => {
        const issuedBond = facility.facilityStage === 'Issued';
        const unconditionalLoan = facility.facilityStage === 'Unconditional';

        if ((issuedBond || unconditionalLoan)
          && facility.issueFacilityDetailsProvided
          && facility.status === 'Ready for check') {
          return facility;
        }
        return null;
      };

      describe('any unconditional loans', () => {
        it('should add issuedFacilitySubmittedToUkefTimestamp, issuedFacilitySubmittedToUkefBy and lastEdited', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const unconditionalLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'loan'
            && f.facilityStage === 'Unconditional');

            // make sure we have some loans to test against
          expect(unconditionalLoansThatShouldBeUpdated.length > 0).toEqual(true);

          unconditionalLoansThatShouldBeUpdated.forEach((loan) => {
            const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(typeof updatedLoan.lastEdited).toEqual('string');
            expect(typeof updatedLoan.issuedFacilitySubmittedToUkefTimestamp).toEqual('string');
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.username).toEqual(expectedFacilitiesSubmittedBy.username);
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.email).toEqual(expectedFacilitiesSubmittedBy.email);
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.firstname).toEqual(expectedFacilitiesSubmittedBy.firstname);
            expect(updatedLoan.issuedFacilitySubmittedToUkefBy.lastname).toEqual(expectedFacilitiesSubmittedBy.lastname);
          });
        });
      });

      describe('any issued bonds', () => {
        it('should add issuedFacilitySubmittedToUkefTimestamp, issuedFacilitySubmittedToUkefBy and lastEdited', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'bond'
            && f.facilityStage === 'Issued');

          // make sure we have some bonds to test against
          expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
            expect(typeof updatedBond.lastEdited).toEqual('string');
            expect(typeof updatedBond.issuedFacilitySubmittedToUkefTimestamp).toEqual('string');
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.username).toEqual(expectedFacilitiesSubmittedBy.username);
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.email).toEqual(expectedFacilitiesSubmittedBy.email);
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.firstname).toEqual(expectedFacilitiesSubmittedBy.firstname);
            expect(updatedBond.issuedFacilitySubmittedToUkefBy.lastname).toEqual(expectedFacilitiesSubmittedBy.lastname);
          });
        });
      });

      describe('any unconditional loans that have Issue Facility Form details provided (issueFacilityDetailsProvided) and status=`Ready for check`', () => {
        it('should add `Submitted` status and `issueFacilityDetailsSubmitted` property', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const unconditionalLoansThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'loan'
            && isUnsubmittedFacilityWithIssueFacilityDetailsProvided(f));

          // make sure we have some loans to test against
          expect(unconditionalLoansThatShouldBeUpdated.length > 0).toEqual(true);

          unconditionalLoansThatShouldBeUpdated.forEach((loan) => {
            const updatedLoan = body.deal.loanTransactions.items.find((l) => l._id === loan._id);
            expect(updatedLoan.issueFacilityDetailsSubmitted).toEqual(true);
            expect(updatedLoan.status).toEqual('Submitted');
            expect(typeof updatedLoan.lastEdited).toEqual('string');
          });
        });
      });

      describe('any issued bonds that have Issue Facility Form details provided (issueFacilityDetailsProvided) and status=`Ready for check`', () => {
        it('should add `Submitted` status and `issueFacilityDetailsSubmitted` property', async () => {
          expect(updatedDeal.status).toEqual(200);
          expect(updatedDeal.body).toBeDefined();

          const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

          const issuedBondsThatShouldBeUpdated = completedDeal.mockFacilities.filter((f) =>
            f.facilityType === 'bond'
            && isUnsubmittedFacilityWithIssueFacilityDetailsProvided(f));

          // make sure we have some bonds to test against
          expect(issuedBondsThatShouldBeUpdated.length > 0).toEqual(true);

          issuedBondsThatShouldBeUpdated.forEach((bond) => {
            const updatedBond = body.deal.bondTransactions.items.find((b) => b._id === bond._id);
            expect(updatedBond.issueFacilityDetailsSubmitted).toEqual(true);
            expect(updatedBond.status).toEqual('Submitted');
            expect(typeof updatedBond.lastEdited).toEqual('string');
          });
        });
      });

    });
  });
});
