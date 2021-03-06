const mapGefDealSnapshot = require('./mapGefDealSnapshot');
const mapGefDealDetails = require('./mapGefDealDetails');
const mapGefFacilities = require('../gef-facilities/mapGefFacilities');
const mapTotals = require('../deal/mapTotals');
const mapGefSubmissionDetails = require('./mapGefSubmissionDetails');
const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');

describe('mapGefDealSnapshot', () => {
  const mockFacilities = [
    {
      facilitySnapshot: MOCK_GEF_DEAL.facilities[0],
      tfm: {
        facilityValueInGBP: '123,45.00',
      },
    },
  ];

  const mockDeal = {
    _id: MOCK_GEF_DEAL._id,
    dealSnapshot: {
      ...MOCK_GEF_DEAL,
      facilities: mockFacilities,
    },
    tfm: {},
  };

  it('should return mapped deal', () => {
    const result = mapGefDealSnapshot(mockDeal.dealSnapshot);

    const expected = {
      _id: MOCK_GEF_DEAL._id,
      details: mapGefDealDetails(mockDeal.dealSnapshot),
      submissionDetails: mapGefSubmissionDetails(mockDeal.dealSnapshot),
      eligibilityCriteria: [],
      eligibility: {},
      dealFiles: {},
      facilities: mapGefFacilities(mockDeal.dealSnapshot),
      totals: mapTotals(mockDeal.dealSnapshot.facilities),
    };

    expect(result).toEqual(expected);
  });
});
