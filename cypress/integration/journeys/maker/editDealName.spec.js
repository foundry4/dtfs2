const {login} = require('../../missions');

const {contract, editDealName} = require('../../pages');
const relative = require('../../relativeURL');

const user = {username: 'MAKER', password: 'MAKER'};

context('Edit deal name', () => {

  let deal = {
    details: {
      bankSupplyContractID: 'abc/1/def',
      bankSupplyContractName: 'Tibettan submarine acquisition scheme'
    }
  };

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    // clear down our test users old deals, and insert a new one - updating our deal object
    cy.deleteAllDeals(user);
    cy.createADeal(deal, user);
  });

  it('updates deal.details.bankSupplyContractName', () => {
    login(user);

    cy.uncacheDeals().then( (deals) => {
      const deal = deals[0];

      contract.visit(deal);
      contract.editDealName().click();


      editDealName.bankSupplyContractName().type('{selectall}{backspace}asdfasfasf');
      editDealName.submit().click();

      contract.bankSupplyContractName().invoke('text').then((text) => {
        expect(text.trim()).equal('asdfasfasf')
      });
    });
  });

});
