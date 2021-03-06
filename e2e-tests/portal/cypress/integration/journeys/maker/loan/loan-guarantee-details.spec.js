const pages = require('../../../pages');
const partials = require('../../../partials');
const fillLoanForm = require('./fill-loan-forms');
const assertLoanFormValues = require('./assert-loan-form-values');
const LOAN_FORM_VALUES = require('./loan-form-values');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

const goToPage = (deal) => {
  cy.loginGoToDealPage(MAKER_LOGIN, deal);
  pages.contract.addLoanButton().click();
};

const assertVisibleRequestedCoverStartDateInputs = () => {
  pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().should('be.visible');
  pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().should('be.visible');
  pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().should('be.visible');
};

const assertVisibleCoverEndDateInputs = () => {
  pages.loanGuaranteeDetails.coverEndDateDayInput().should('be.visible');
  pages.loanGuaranteeDetails.coverEndDateMonthInput().should('be.visible');
  pages.loanGuaranteeDetails.coverEndDateYearInput().should('be.visible');
};

context('Loan Guarantee Details', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('when submitting an empty form', () => {
    it('should progress to `Loan Financial Details` page and after proceeding to `Loan Preview` page, should render Facility stage validation error in `Loan Guarantee Details` page', () => {
      goToPage(deal);

      cy.url().should('include', '/contract');
      cy.url().should('include', '/loan/');
      cy.url().should('include', '/guarantee-details');

      pages.loanGuaranteeDetails.submit().click();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/financial-details');

      pages.loanFinancialDetails.submit().click();

      cy.url().should('include', '/dates-repayments');
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/check-your-answers');

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      cy.url().should('include', '/guarantee-details');

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
      pages.loanGuaranteeDetails.facilityStageErrorMessage().should('be.visible');
    });
  });

  describe('when a maker selects different Facility stage options (`Conditional` or `Unconditional`)', () => {
    it('should render additional form fields', () => {
      goToPage(deal);

      // Facility stage = Conditional
      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      pages.loanGuaranteeDetails.conditionalBankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');

      // Facility stage = Unconditional
      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().should('be.visible');
      assertVisibleCoverEndDateInputs();
    });
  });

  describe('when a maker submits Facility stage as `Conditional`', () => {
    it('should render additional form fields and validation errors when returning to the page ', () => {
      goToPage(deal);

      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      pages.loanGuaranteeDetails.submit().click();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);

      pages.loanGuaranteeDetails.facilityStageConditionalInput().should('be.checked');
      pages.loanGuaranteeDetails.conditionalBankReferenceNumberInput().should('be.visible');

      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsErrorMessage().should('be.visible');
    });
  });

  describe('when a maker submits Facility stage as `Unconditional`', () => {
    it('should render additional form fields and validation errors when returning to the page and render a `Not entered` link in the Deal page when (optional) Bank Reference Number is not provided', () => {
      goToPage(deal);

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      pages.loanGuaranteeDetails.submit().click();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 2);

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().should('be.checked');

      pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.unconditionalBankReferenceNumberErrorMessage().should('be.visible');

      assertVisibleRequestedCoverStartDateInputs();
      assertVisibleCoverEndDateInputs();

      pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');

      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        pages.loanGuaranteeDetails.saveGoBackButton().click();

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.bankReferenceNumberLink().invoke('text').then((text) => {
          expect(text.trim()).equal('Not entered');
          // assert that clicking the `bank reference number` link progesses to the guarantee details page
          row.bankReferenceNumberLink().click();
          cy.url().should('include', '/contract');
          cy.url().should('include', '/loan/');
          cy.url().should('include', '/guarantee-details');
        });
      });
    });
  });

  it('should prepopulate form inputs from submitted data and render a checked checkbox in progress nav', () => {
    goToPage(deal);

    // Facility stage = Conditional
    fillLoanForm.guaranteeDetails.facilityStageConditional();
    pages.loanGuaranteeDetails.submit().click();

    partials.taskListHeader.itemLink('loan-guarantee-details').click();
    assertLoanFormValues.guaranteeDetails.facilityStageConditional();

    // Facility stage = Unconditional
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();

    // assert that bankReferenceNumber value is retained
    pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);
    pages.loanGuaranteeDetails.submit().click();

    partials.taskListHeader.itemLink('loan-guarantee-details').click();
    assertLoanFormValues.guaranteeDetails.facilityStageUnconditional();
  });

  describe('When a maker clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Loan Guarantee Details` page', () => {
      goToPage(deal);

      fillLoanForm.guaranteeDetails.facilityStageUnconditional();

      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        pages.loanGuaranteeDetails.saveGoBackButton().click();

        cy.url().should('not.include', '/guarantee-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.bankReferenceNumberLink().click();
        cy.url().should('include', '/loan/');
        cy.url().should('include', '/guarantee-details');

        assertLoanFormValues.guaranteeDetails.facilityStageUnconditional();
      });
    });
  });
});
