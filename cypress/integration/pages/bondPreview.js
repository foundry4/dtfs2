const page = {
  goBackLink: () => cy.get('[data-cy="go-back-link"]'),

  // bond details
  bondIssuer: () => cy.get('[data-cy="bond-issuer"]'),
  bondType: () => cy.get('[data-cy="bond-type"]'),
  bondStage: () => cy.get('[data-cy="bond-stage"]'),
  requestedCoverStartDate: () => cy.get('[data-cy="requested-cover-start-date"]'),
  coverEndDate: () => cy.get('[data-cy="cover-end-date"]'),
  uniqueIdentificationNumber: () => cy.get('[data-cy="unique-identification-number"]'),
  bondBeneficiary: () => cy.get('[data-cy="bond-beneficiary"]'),

  // bond financial details
  bondValue: () => cy.get('[data-cy="bond-value"]'),
  transactionCurrencySameAsSupplyContractCurrency: () => cy.get('[data-cy="transaction-currency-same-as-supply-contract-currency"]'),
  riskMarginFee: () => cy.get('[data-cy="risk-margin-fee"]'),
  coveredPercentage: () => cy.get('[data-cy="covered-percentage"]'),
  minimumRiskMarginFee: () => cy.get('[data-cy="minimum-risk-margin-fee"]'),
  guaranteeFeePayableByBank: () => cy.get('[data-cy="guarantee-fee-payable-by-bank"]'),
  ukefExposure: () => cy.get('[data-cy="ukef-exposure"]'),

  // bond fee details
  feeType: () => cy.get('[data-cy="fee-type"]'),
  feeFrequency: () => cy.get('[data-cy="fee-frequency"]'),
  dayCountBasis: () => cy.get('[data-cy="day-count-basis"]'),
};

module.exports = page;
