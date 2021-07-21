/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import submitToUkef from './pages/submit-to-ukef';
import submitToUkefConfirmation from './pages/submit-to-ukef-confirmation';
import CREDENTIALS from '../fixtures/credentials.json';

const applicationIds = [];

context('Submit to UKEF', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          applicationIds.push(item._id);
        });
      });
    cy.login(CREDENTIALS.CHECKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationIds[2]}/submit-to-ukef`));
  });

  // TODO add negative tests - i.e. checking that the application state is correct.

  describe('Submit to UKEF', () => {
    it('displays the page as expected', () => {
      submitToUkef.mainHeading();
      submitToUkef.comment();
      submitToUkef.submitButton();
      submitToUkef.cancelLink();
    });

    it('submits without comments and displays the confirmation page', () => {
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanel();
      submitToUkefConfirmation.dashboardLink();
    });

    it('submits with comments', () => {
      submitToUkef.comment().type('Test comment');
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.confirmationPanel();
    });

    it('display an error when the comment is greater than 400 characters', () => {
      const longComment = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam accumsan diam eu elit 
                           pellentesque, ac tempor lorem luctus. Sed ornare elit non tortor bibendum, quis tincidunt lectus dictum. 
                           Quisque enim augue, viverra eget finibus eget, lacinia sit amet tortor. 
                           Aenean nisl lectus, placerat vel arcu eu, pharetra imperdiet velit. Vestibulum et dolor et magna bibendum mattis. 
                           Aenean egestas pharetra.`;

      submitToUkef.comment().type(longComment);
      submitToUkef.submitButton().click();
      submitToUkef.errorSummary();
    });

    it('takes checker back to application preview page when cancelled', () => {
      submitToUkef.comment().type('Some comments here ....');
      submitToUkef.cancelLink().click();
      cy.location('pathname').should('eq', `/gef/application-details/${applicationIds[2]}/preview`);
    });

    it('takes checker to dashboard from the confirmation page', () => {
      // the portal throws an exception on the dashboard page; this stops cypress caring
      cy.on('uncaught:exception', () => false);
      submitToUkef.submitButton().click();
      submitToUkefConfirmation.dashboardLink().click();
      cy.location('pathname').should('contain', 'dashboard');
    });
  });
});
