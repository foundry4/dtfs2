/* eslint-disable no-undef */
const submitToUkefConfirmation = {
  confirmationPanel: () => cy.get('[data-cy="ukef-submission-confirmation"]'),
  dashboardLink: () => cy.get('[data-cy="dashboard-link"]'),
};

export default submitToUkefConfirmation;
