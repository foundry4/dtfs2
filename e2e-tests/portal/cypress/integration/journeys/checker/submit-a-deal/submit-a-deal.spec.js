const { contract, contractConfirmSubmission } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank') );
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank') );

// test data we want to set up + work with..
const dealWithInvalidLoanCoverStartDate = require('./test-data/dealWithInvalidLoanCoverStartDate');
const dealWithInvalidBondCoverStartDate = require('./test-data/dealWithInvalidBondCoverStartDate');
const submittedDealWithBondCoverStartDateInThePast = require('./test-data/submittedDealWithBondCoverStartDateInThePast');
const submittedDealWithLoanCoverStartDateInThePast = require('./test-data/submittedDealWithLoanCoverStartDateInThePast');
const dealReadyToSubmit = require('./test-data/dealReadyToSubmit');


context('A checker selects to submit a contract from the view-contract page', () => {
  let goodDeal;
  let badDealInvalidLoanCoverStartDate;
  let badDealInvalidBondCoverStartDate;
  let submittedDealBondCoverStartDateInThePast;
  let submittedDealLoanCoverStartDateInThePast;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.insertManyDeals([
      dealReadyToSubmit(),
      dealWithInvalidLoanCoverStartDate(),
      dealWithInvalidBondCoverStartDate(),
      submittedDealWithBondCoverStartDateInThePast(),
      submittedDealWithLoanCoverStartDateInThePast(),
    ], MAKER_LOGIN)
      .then(insertedDeals => {
        goodDeal=insertedDeals[0];
        badDealInvalidLoanCoverStartDate=insertedDeals[1];
        badDealInvalidBondCoverStartDate = insertedDeals[2];
        submittedDealBondCoverStartDateInThePast = insertedDeals[3];
        submittedDealLoanCoverStartDateInThePast = insertedDeals[4];
      });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    // cancel
    contractConfirmSubmission.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${goodDeal._id}`));
  });

  it('The Accept and Submit button generates an error if the checkbox has not been ticked.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    // submit without checking the checkbox
    contractConfirmSubmission.acceptAndSubmit().click();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${goodDeal._id}/confirm-submission`));
    contractConfirmSubmission.expectError('Acceptance is required.');

    // expect the deal status to be unchanged
    contract.visit(goodDeal);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal("Ready for Checker's approval");
    });
  });

  it('If the deal has NOT yet been submitted and the deal contains a loan with a cover start date that is now in the past, an error should be generated.', () => {
    // log in, visit a deal, submit
    cy.login(CHECKER_LOGIN);
    contract.visit(badDealInvalidLoanCoverStartDate);
    contract.proceedToSubmit().click();

    // submit with checkbox checked
    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    // expect to stay on the submission page, and see an error
    cy.url().should('eq', relative(`/contract/${badDealInvalidLoanCoverStartDate._id}/confirm-submission`));
    contractConfirmSubmission.expectError('Requested Cover Start Date must be today or in the future');

    // expect the deal status to be unchanged
    contract.visit(badDealInvalidLoanCoverStartDate);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal("Ready for Checker's approval");
    });
  });

  it('If the deal has NOT yet been submitted and the deal contains a bond with a cover start date that is now in the past, an error should be generated.', () => {
    // log in, visit a deal, submit
    cy.login(CHECKER_LOGIN);
    contract.visit(badDealInvalidBondCoverStartDate);
    contract.proceedToSubmit().click();

    // submit with checkbox checked
    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    // expect to stay on the submission page, and see an error
    cy.url().should('eq', relative(`/contract/${badDealInvalidBondCoverStartDate._id}/confirm-submission`));
    contractConfirmSubmission.expectError('Requested Cover Start Date must be today or in the future');

    // expect the deal status to be unchanged
    contract.visit(badDealInvalidBondCoverStartDate);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal("Ready for Checker's approval");
    });
  });

  describe('If a deal has been previously submitted and the deal contains a bond with a cover start date that is now in the past', () => {
    it('it should successfully submit', () => {
      // log in, visit a deal, submit
      cy.login(CHECKER_LOGIN);
      contract.visit(submittedDealBondCoverStartDateInThePast);
      contract.proceedToSubmit().click();

      // submit with checkbox checked
      contractConfirmSubmission.confirmSubmit().check();
      contractConfirmSubmission.acceptAndSubmit().click();

      // expect to land on the /dashboard page with a success message
      cy.url().should('include', '/dashboard');
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract submitted to UKEF./);
      });
    });
  });

  describe('If a deal has been previously submitted and the deal contains a loan with a cover start date that is now in the past', () => {
    it('it should successfully submit', () => {
      // log in, visit a deal, submit
      cy.login(CHECKER_LOGIN);
      contract.visit(submittedDealLoanCoverStartDateInThePast);
      contract.proceedToSubmit().click();

      // submit with checkbox checked
      contractConfirmSubmission.confirmSubmit().check();
      contractConfirmSubmission.acceptAndSubmit().click();

      // expect to land on the /dashboard page with a success message
      cy.url().should('include', '/dashboard');
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract submitted to UKEF./);
      });
    });
  });

  it('If the terms are accepted, the Accept and Submit button submits the deal and takes the user to /dashboard.', () => {
    // log in, visit a deal, select abandon
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    // submit with checkbox checked
    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');
    successMessage.successMessageListItem().invoke('text').then((text) => {
      expect(text.trim()).to.match(/Supply Contract submitted to UKEF./);
    });


    // visit the deal and confirm the updates have been made
    contract.visit(goodDeal);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Submitted');
    });
    contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal("Ready for Checker's approval");
    });

    // cy.downloadFile( deal, {...checker}).then( (typeA) =>{
    //   expect(typeA).not.to.equal('');
    // });

  });

});
