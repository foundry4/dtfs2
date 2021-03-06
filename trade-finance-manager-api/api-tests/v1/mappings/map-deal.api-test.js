const mapDeal = require('../../../src/v1/mappings/map-deal');
const CONTENT_STRINGS = require('../../../src/v1/content-strings');
const { facilities, bondTransactions, loanTransactions } = require('../../../src/v1/__mocks__/mock-deal');

describe('mappings - map-deal', () => {
  const mockBonds = bondTransactions.items.map(({ _id }) => ({ _id }));
  const mockLoans = loanTransactions.items.map(({ _id }) => ({ _id }));

  const allFacilities = bondTransactions.items.concat(loanTransactions.items);


  const mockDeal = {
    eligibility: {
      criteria: [
        {
          id: 11,
          description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
          answer: true,
        },
        {
          id: 12,
          description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.',
          answer: true,
        },
        {
          id: 13,
          description: 'The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
          answer: false,
        },
        {
          id: 14,
          description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
          answer: true,
        },
        {
          id: 15,
          description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
          answer: true,
        },
        {
          id: 16,
          description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.',
          answer: true,
        },
        {
          id: 17,
          description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
          answer: true,
        },
        {
          id: 18,
          description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.',
          answer: true,
        },
      ],
    },
    facilities,
    bondTransactions: {
      items: mockBonds,
    },
    loanTransactions: {
      items: mockLoans,
    },
  };

  it('should map facilities and update eligibility.criteria from content-strings', async () => {
    const deal = mockDeal;
    const result = await mapDeal(deal);

    const expectedCriteria = (criteria) =>
      criteria.map((criterion) => {
        const mappedCriterion = criterion;
        const { id } = mappedCriterion;

        mappedCriterion.description = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].description;
        mappedCriterion.descriptionList = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[id].descriptionList;
        return mappedCriterion;
      });

    const mockDealWithoutBondsAndLoans = deal;
    delete mockDealWithoutBondsAndLoans.bondTransactions;
    delete mockDealWithoutBondsAndLoans.loanTransactions;

    const expected = {
      ...mockDeal,
      eligibility: {
        ...mockDeal.eligibility,
        criteria: expectedCriteria(mockDeal.eligibility.criteria),
      },
      bondTransactions: {},
      loanTransactions: {},
      facilities: allFacilities.map((f) => ({
        _id: f._id,
        facilitySnapshot: {
          _id: f._id,
        },
      })),
    };

    expect(result).toMatchObject(expected);
  });
});
