const relative = require('../../../../relativeURL');
const pages = require('../../../../pages');
const MIADealWithUnissuedFacilities = require('../MIA-deal-with-unissued-facilities');
const mockUsers = require('../../../../../fixtures/mockUsers');
const { fillAndSubmitIssueBondFacilityForm } = require('../../../maker/fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Checker sumits an MIA deal with `Unissued` bonds and `Conditional` loans; workflow responds with `Approved` status', () => {
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
    cy.insertOneDeal(MIADealWithUnissuedFacilities, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MIADealWithUnissuedFacilities;

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

  it('Maker should be able to issue facilities, facilities should have `Not started` statuses', () => {
    //---------------------------------------------------------------
    // checker submits deal to UKEF
    //---------------------------------------------------------------
    // TODO we could get the mock data in the shape that the deal is in after submission
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToSubmit().click();

    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    cy.updatePortalDealStatus(dealId, 'approved');

    //---------------------------------------------------------------
    // receive typeB XML with `Approved` deal status
    //---------------------------------------------------------------
    // cy.sendTypeB({
    //   header: {
    //     portal_deal_id: dealId,
    //     bank_deal_id: deal.details.bankSupplyContractID,
    //     Message_Type: 'B',
    //     Action_Code: '016',
    //   },
    //   deal: {
    //     UKEF_deal_id: dealId,
    //     Deal_status: 'approved',
    //   },
    //   bonds: [
    //     {
    //       BSS_portal_facility_id: dealFacilities.bonds[0]._id,
    //       BSS_ukef_facility_id: '12345',
    //       BSS_status: '""',
    //     },
    //   ],
    //   loans: [
    //     {
    //       EWCS_portal_facility_id: dealFacilities.loans[0]._id,
    //       EWCS_ukef_facility_id: '56789',
    //       EWCS_status: '""',
    //     },
    //   ],
    // });

    //---------------------------------------------------------------
    // assert that:
    // facilities that could be issued, have correct status
    // Issue Facility link is displayed and takes user to Issue Facility Form
    // maker can view and submit issue facility form
    // make can submit deal
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    // bond
    const bondId = dealFacilities.bonds[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    bondRow.issueFacilityLink().should('be.visible');
    bondRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/issue-facility`));
    fillAndSubmitIssueBondFacilityForm();

    // loan
    pages.contract.visit(deal);
    const loanId = dealFacilities.loans[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Not started');
    });

    loanRow.issueFacilityLink().should('be.visible');
    loanRow.issueFacilityLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    // re-submit the deal for review
    pages.contract.visit(deal);

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Issued a facility');
    pages.contractReadyForReview.readyForCheckersApproval().click();
    // expect to land on the dashboard after successful submit
    cy.url().should('eq', relative('/dashboard/0'));
  });
});
