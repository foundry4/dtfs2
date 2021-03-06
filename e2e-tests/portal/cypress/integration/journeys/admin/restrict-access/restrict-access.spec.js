const { users, header, reports } = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const validUsers = ['ADMIN', 'UKEF_OPERATIONS'];
const invalidUsers = ['MAKER', 'CHECKER', 'EDITOR'];

context('Only allow authorised users to access admin pages', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  context('User admin', () => {
    it('Valid users can access', () => {
      // login and go to dashboard
      validUsers.forEach((validUser) => {
        const user = mockUsers.find((user) => (user.username.includes(validUser)));
        cy.login(user);
        users.visit();

        cy.url().should('eq', relative('/admin/users/'));
        header.logOut();
      });
    });

    it('Invalid users cannot access', () => {
      // login and go to dashboard
      invalidUsers.forEach((invalidUser) => {
        const user = mockUsers.find((user) => (user.username.includes(invalidUser)));
        cy.login(user);
        users.visit();

        cy.url().should('eq', relative('/not-found'));
        header.logOut();
      });
    });
  });

  context('Reconciliation report', () => {
    it('Valid users can access', () => {
      // login and go to dashboard
      validUsers.forEach((validUser) => {
        const user = mockUsers.find((user) => (user.username.includes(validUser)));
        cy.login(user);
        reports.reconciliationReport.visit();

        cy.url().should('eq', relative('/reports/reconciliation-report/0'));
        header.logOut();
      });
    });

    it('Invalid users cannot access', () => {
      // login and go to dashboard
      invalidUsers.forEach((invalidUser) => {
        const user = mockUsers.find((user) => (user.username.includes(invalidUser)));
        cy.login(user);
        reports.reconciliationReport.visit();

        cy.url().should('eq', relative('/not-found'));
        header.logOut();
      });
    });
  });
});
