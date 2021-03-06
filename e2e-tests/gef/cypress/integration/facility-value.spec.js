/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import facilityValue from './pages/facility-value';
import CREDENTIALS from '../fixtures/credentials.json';

const applications = [];
let token;

context('Facility Value Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          cy.apiFetchAllFacilities(item._id, token)
            .then((res) => {
              applications.push({
                id: item._id,
                facilities: res.body.items.filter((it) => it.details.applicationId === item._id),
              });
            });
        });
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('Visiting page as cash facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[1].details._id}/facility-value`));
      facilityValue.backLink();
      facilityValue.headingCaption();
      facilityValue.mainHeading().contains('interest');
      facilityValue.hiddenFacilityType().should('be', 'invisible');
      facilityValue.valueLabel().should('contain', 'cash');
      facilityValue.valueSuffix().should('contain', 'EUR');
      facilityValue.doneButton();
    });

    it('redirects user to `facility currency` page when clicking on `Back` Link', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-currency`));
    });

    it('hides back button if visiting page with `change` query', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value?status=change`));
      facilityValue.backLink().should('not.be', 'visible');
    });
  });

  describe('Visiting page as contingent facility', () => {
    it('displays the correct elements', () => {
      cy.visit(relative(`/gef/application-details/${applications[2].id}/facilities/${applications[2].facilities[2].details._id}/facility-value`));
      facilityValue.backLink();
      facilityValue.headingCaption();
      facilityValue.mainHeading().contains('risk');
      facilityValue.hiddenFacilityType().should('be', 'invisible');
      facilityValue.valueLabel().should('contain', 'contingent');
      facilityValue.valueSuffix().should('contain', 'YEN');
      facilityValue.doneButton();
    });
  });

  describe('Percentage of cover field', () => {
    it('only allows the user to enter a value between 1 and 80', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.percentageCover().type(0);
      facilityValue.doneButton().click();
      facilityValue.errorSummary();
      facilityValue.percentageCoverError();

      facilityValue.percentageCover().clear();
      facilityValue.percentageCover().type(-1);
      facilityValue.doneButton().click();
      facilityValue.errorSummary();
      facilityValue.percentageCoverError();

      facilityValue.percentageCover().clear();
      facilityValue.percentageCover().type('a');
      facilityValue.doneButton().click();
      facilityValue.errorSummary();
      facilityValue.percentageCoverError();

      facilityValue.percentageCover().clear();
      facilityValue.percentageCover().type(81);
      facilityValue.doneButton().click();
      facilityValue.errorSummary();
      facilityValue.percentageCoverError();

      facilityValue.percentageCover().clear();
      facilityValue.percentageCover().type(80);
      facilityValue.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));

      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.percentageCover().clear();
      facilityValue.percentageCover().type(1);
      facilityValue.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));

      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.percentageCover().clear();
      facilityValue.percentageCover().type(79);
      facilityValue.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });
  });

  describe('Interest margin Percentage field', () => {
    it('only allows the user to enter a value between 0 and 100, and allows decimal places', () => {
      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.interestPercentage().clear();
      facilityValue.interestPercentage().type(-1);
      facilityValue.doneButton().click();
      facilityValue.errorSummary();
      facilityValue.interestPercentageError();

      facilityValue.interestPercentage().clear();
      facilityValue.interestPercentage().type('a');
      facilityValue.doneButton().click();
      facilityValue.errorSummary();
      facilityValue.interestPercentageError();

      facilityValue.interestPercentage().clear();
      facilityValue.interestPercentage().type(101);
      facilityValue.doneButton().click();
      facilityValue.errorSummary();
      facilityValue.interestPercentageError();

      facilityValue.interestPercentage().clear();
      facilityValue.interestPercentage().type(1);
      facilityValue.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));

      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.interestPercentage().clear();
      facilityValue.interestPercentage().type(100);
      facilityValue.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));

      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.interestPercentage().clear();
      facilityValue.interestPercentage().type(79);
      facilityValue.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));

      cy.visit(relative(`/gef/application-details/${applications[1].id}/facilities/${applications[1].facilities[1].details._id}/facility-value`));
      facilityValue.interestPercentage().clear();
      facilityValue.interestPercentage().type(10.1);
      facilityValue.doneButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applications[1].id}`));
    });
  });
});
