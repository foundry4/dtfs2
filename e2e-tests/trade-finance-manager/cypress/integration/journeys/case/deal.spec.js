import relative from '../../relativeURL';
import pages from '../../pages';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../fixtures/users-portal';

context('User can view a case deal', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);
      });
  });

  beforeEach(() => {
    cy.login(MOCK_USERS[0]);
    cy.visit(relative(`/case/${dealId}/deal`));
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('should render case deal components', () => {
    pages.caseDealPage.caseSummary().should('exist');
    pages.caseDealPage.caseSubNavigation().should('exist');
    pages.caseDealPage.dealBankDetails().should('exist');
    pages.caseDealPage.dealFacilities().should('exist');
    pages.caseDealPage.mgaVersion().should('exist');
  });

  it('should render correct MGA version', () => {
    pages.caseDealPage.mgaVersion().should('have.text', 'January 2020');
  });

  describe('facilities table', () => {
    it('clicking `Facility ID` link should take user to facility details page', () => {
      const facilityId = dealFacilities[0]._id; // eslint-disable-line no-underscore-dangle
      const facilityRow = pages.caseDealPage.dealFacilitiesTable.row(facilityId);

      facilityRow.facilityId().click();

      cy.url().should('eq', relative(`/case/${dealId}/facility/${facilityId}`));
    });
  });
});
