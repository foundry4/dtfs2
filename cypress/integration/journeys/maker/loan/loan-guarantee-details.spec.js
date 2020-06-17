const moment = require('moment');
const pages = require('../../../pages');
const partials = require('../../../partials');
const fillLoanForm = require('./fill-loan-forms');
const assertLoanFormValues = require('./assert-loan-form-values');
const LOAN_FORM_VALUES = require('./loan-form-values');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Loan Guarantee Details', () => {
  let deal;

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

  const inputRequestedCoverStartDate = (date) => {
    pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().type(moment(date).format('DD'));
    pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().type(moment(date).format('MM'));
    pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().type(moment(date).format('YYYY'));
  };

  const inputCoverEndDate = (date) => {
    const day = date ? date.format('DD') : LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay;
    const month = date ? date.format('MM') : LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth;
    const year = date ? date.format('YYYY') : LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear;

    pages.loanGuaranteeDetails.coverEndDateDayInput().type(day);
    pages.loanGuaranteeDetails.coverEndDateMonthInput().type(month);
    pages.loanGuaranteeDetails.coverEndDateYearInput().type(year);
  };

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('when submitting an empty form', () => {
    it('it should progress to `Loan Financial Details` page and after proceeding to `Loan Preview` page and returning to `Loan Guarantee Details` page, should render Facility stage validation error', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/loan/');
      cy.url().should('include', '/guarantee-details');

      pages.loanGuaranteeDetails.submit().click();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/financial-details');

      pages.loanFinancialDetails.submit().click();

      cy.url().should('include', '/dates-repayments');
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/preview');

      partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();

      cy.url().should('include', '/guarantee-details');

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
      pages.loanGuaranteeDetails.facilityStageErrorMessage().should('be.visible');
    });
  });

  describe('when user selects different Facility stage options (`Conditional` or `Unconditional`)', () => {
    it('should render additional form fields and validation errors without leaving the page', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      // Facility stage = Conditional
      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      pages.loanGuaranteeDetails.conditionalBankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsErrorMessage().should('be.visible');

      // Facility stage = Unconditional
      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.unconditionalBankReferenceNumberErrorMessage().should('be.visible');
      assertVisibleCoverEndDateInputs();

      pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');
    });
  });

  describe('when user submits Facility stage as `Conditional`', () => {
    it('should render additional form fields and validation errors when returning to the page ', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      pages.loanGuaranteeDetails.submit().click();

      partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);

      pages.loanGuaranteeDetails.facilityStageConditionalInput().should('be.checked');
      pages.loanGuaranteeDetails.conditionalBankReferenceNumberInput().should('be.visible');

      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsErrorMessage().should('be.visible');
    });
  });

  describe('when user submits Facility stage as `Unconditional`', () => {
    it('should render additional form fields and validation errors when returning to the page ', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      pages.loanGuaranteeDetails.submit().click();

      partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 2);

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().should('be.checked');

      pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.unconditionalBankReferenceNumberErrorMessage().should('be.visible');

      assertVisibleRequestedCoverStartDateInputs();
      assertVisibleCoverEndDateInputs();

      pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');
    });

    describe('when the Requested Cover Start Date has a future date of more than 3 months', () => {
      it('should render Requested Cover Start Date validation error', () => {
        cy.loginGoToDealPage(user, deal);
        pages.contract.addLoanButton().click();

        pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
        pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);

        const date = moment();
        const requestedCoverStartDate = moment(date).add(3, 'months').add('1', 'day');

        inputRequestedCoverStartDate(requestedCoverStartDate);
        inputCoverEndDate();

        pages.loanGuaranteeDetails.submit().click();

        partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 1);
        pages.loanGuaranteeDetails.requestedCoverStartDateErrorMessage().should('be.visible');
      });
    });

    describe('when the Cover End Date is before today', () => {
      it('should render Cover End Date validation error', () => {
        cy.loginGoToDealPage(user, deal);
        pages.contract.addLoanButton().click();

        pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
        pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);

        const coverEndDate = moment().subtract(1, 'day');
        inputCoverEndDate(coverEndDate);

        pages.loanGuaranteeDetails.submit().click();

        partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 1);
        pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');
      });
    });

    describe('when the Cover End Date is before the Requested Cover Start Date', () => {
      it('should render Cover End Date validation error', () => {
        cy.loginGoToDealPage(user, deal);
        pages.contract.addLoanButton().click();

        pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
        pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);

        const date = moment();
        const requestedCoverStartDate = date;
        const coverEndDate = moment(date).subtract(1, 'day');

        inputRequestedCoverStartDate(requestedCoverStartDate);
        inputCoverEndDate(coverEndDate);

        pages.loanGuaranteeDetails.submit().click();

        partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 1);
        pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');
      });
    });
  });

  it('should prepopulate form inputs from submitted data and render a checked checkbox only for `Guarantee Details` in progress nav', () => {
    cy.loginGoToDealPage(user, deal);
    pages.contract.addLoanButton().click();

    // Facility stage = Conditional
    fillLoanForm.guaranteeDetails.facilityStageConditional();
    pages.loanGuaranteeDetails.submit().click();

    partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();
    assertLoanFormValues.guaranteeDetails.facilityStageConditional();

    // Facility stage = Unconditional
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();

    // assert that bankReferenceNumber value is retained
    pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);
    pages.loanGuaranteeDetails.submit().click();

    partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();
    assertLoanFormValues.guaranteeDetails.facilityStageUnconditional();
  });
});
