const pages = require('../../../../pages');
const dealWithNotStartedFacilityStatuses = require('./AIN-deal-with-unissued-facilities');
const mockUsers = require('../../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Checker submits an AIN deal with `Unissued` bonds and `Unconditional` loans; workflow responds', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);

    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = dealWithNotStartedFacilityStatuses;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
  });

  it('Updates the statuses of `Unissued` bonds and `Conditional` loans from `Completed` to `Not started`', () => {
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);


    bondRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Unissued');
    });

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    loanRow.facilityStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Conditional');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: deal._id,
        bank_deal_id: deal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '016',
      },
      deal: {
        UKEF_deal_id: deal._id,
        Deal_status: 'submission_acknowledged',
      },
      bonds: [
        {
          BSS_portal_facility_id: dealFacilities.bonds[0]._id,
          BSS_ukef_facility_id: '12345',
          BSS_status: '""',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: dealFacilities.loans[0]._id,
          EWCS_ukef_facility_id: '56789',
          EWCS_status: '""',
        },
      ],
    });

    pages.contract.visit(deal);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });
  });
});
