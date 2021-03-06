const partials = require('../partials');
const relative = require('../relativeURL');
const mockUsers = require('../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Skip link should take user to the main content of a page', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('When a user keyboard tabs from the html body, skip link should be focused and take the user to the page\'s #main-content', () => {
    cy.login(MAKER_LOGIN);
    cy.url().should('eq', relative('/dashboard/0'));

    // note:
    // unfortunately, cypress currently does not natively support keyboard tabbing.
    // therefore, when tabbing to display the 'skip link',
    // the skip link does not 'appear' as it would in a regular browser outside of cypress.
    // we therefore cannot reliably test if the element is 'visibile' or 'in viewport'.
    // however, in this case, the link works, as it's a DOM element that is on the page.
    // so, we can only test that the link goes to the right place after tabbing to it.

    cy.get('body').tab();

    partials.skipLink.link().should('have.focus');

    partials.skipLink.link().click();

    cy.url().should('eq', relative('/dashboard/0#main-content'));
  });
});
