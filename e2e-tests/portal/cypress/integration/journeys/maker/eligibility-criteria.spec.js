const {
  contract,
  eligibilityCriteria,
  eligibilityDocumentation,
  defaults,
} = require('../../pages');
const { errorSummary, taskListHeader } = require('../../partials');

const criteriaCount = 8;

const mockUsers = require('../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

context('Eligibility Criteria', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.createADeal({
      ...MAKER_LOGIN,
      bankDealId: 'someDealId',
      bankDealName: 'someDealName',
    });

    contract.eligibilityCriteriaLink().click();
  });

  it('The eligibility criteria page is displayed', () => {
    cy.url().should('include', '/eligibility/criteria');
    cy.title().should('eq', `Eligibility Criteria - someDealName${defaults.pageTitleAppend}`);
  });

  it('should display the correct number of eligibility criteria', () => {
    eligibilityCriteria.eligibilityCriteriaItems().should('have.length', criteriaCount);
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().should('have.length', criteriaCount);
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.falseInput().should('have.length', criteriaCount);
  });

  it('should initially display radio buttons in unselected state', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().should('not.be.checked');
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.falseInput().should('not.be.checked');
  });

  it('should display validation errors when partially submitted', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().first().click();
    eligibilityCriteria.nextPageButton().click();

    taskListHeader.itemLink('eligibility-criteria').click();

    errorSummary.errorSummaryLinks().should('have.length', criteriaCount - 1);
  });

  it('should toggle display of criteria 11 extra info if criteria 11 is true/false', () => {
    eligibilityCriteria.eligibilityCriteria11ExtraInfo().should('not.be.visible');

    eligibilityCriteria.eligibilityCriteria11False().click();
    eligibilityCriteria.eligibilityCriteria11ExtraInfo().should('be.visible');

    eligibilityCriteria.eligibilityCriteria11True().click();
    eligibilityCriteria.eligibilityCriteria11ExtraInfo().should('not.be.visible');
  });

  it('should update character count on agents name', () => {
    const characterCount = 150;
    const agentsName = 'Agents name text';

    eligibilityCriteria.eligibilityCriteria11False().click();
    eligibilityCriteria.agentsName.count().should('have.text', `You have ${characterCount} characters remaining`);

    eligibilityCriteria.agentsName.input().type(agentsName);
    eligibilityCriteria.agentsName.count().should('have.text', `You have ${characterCount - agentsName.length} characters remaining`);
  });

  it('should limit agents name to 150 characters', () => {
    const characterCount = 150;
    const longString = 'a'.repeat(characterCount + 1);

    eligibilityCriteria.eligibilityCriteria11False().click();
    eligibilityCriteria.agentsName.input().type(longString);

    eligibilityCriteria.agentsName.count().should('have.text', 'You have 0 characters remaining');
    eligibilityCriteria.agentsName.input().should('have.value', longString.substring(0, characterCount));
  });

  it('should not have a country selected by default', () => {
    eligibilityCriteria.eligibilityCriteria11False().click();
    const agentsCountry = eligibilityCriteria.agentsCountry().find(':selected');

    agentsCountry.should('have.value', '');
    agentsCountry.contains('- Select -').should('have.length', 1);

    eligibilityCriteria.agentsCountry().select('GBR');
    eligibilityCriteria.nextPageButton().click();
    taskListHeader.itemLink('eligibility-criteria').click();

    const agentsCountry2 = eligibilityCriteria.agentsCountry();
    agentsCountry2.find(':selected').should('have.value', 'GBR');
    agentsCountry2.contains('- Select -').should('have.length', 0);
  });

  it('should redirect to supporting docs page when all criteria answered and display submission type on deal page', () => {
    eligibilityCriteria.saveGoBackButton().click();
    contract.eligibilitySubmissionType().should('not.be.visible');

    contract.eligibilityCriteriaLink().click();

    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.nextPageButton().click();

    cy.url().should('include', '/eligibility/supporting-documentation');

    // Check if MIA/AIN notice is on deal page.
    eligibilityDocumentation.saveGoBackButton().click();
    contract.eligibilitySubmissionType().should('be.visible');
  });
});
