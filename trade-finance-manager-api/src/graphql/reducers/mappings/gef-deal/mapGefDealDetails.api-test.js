const mapGefDealDetails = require('./mapGefDealDetails');
const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');

describe('mapGefDealDetails', () => {
  const mockDeal = {
    _id: MOCK_GEF_DEAL._id,
    dealSnapshot: {
      ...MOCK_GEF_DEAL,
      facilities: [],
    },
    tfm: {},
  };

  it('should return mapped details', () => {
    const result = mapGefDealDetails(mockDeal.dealSnapshot);

    const expected = {
      ukefDealId: 'UKEF-ID-TODO',
      bankSupplyContractID: mockDeal.dealSnapshot.bankInternalRefName,
      bankSupplyContractName: mockDeal.dealSnapshot.additionalRefName,
    };

    expect(result).toEqual(expected);
  });
});
