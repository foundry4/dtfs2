/* eslint-disable no-undef */
const submitToUkef = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  comment: () => cy.get('[data-cy="comment"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
};

export default submitToUkef;
