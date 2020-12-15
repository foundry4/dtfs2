const MOCK_DEAL = require('./mock-deal');

const MOCK_DEALS = [
  MOCK_DEAL,
];

module.exports = {
  findOneDeal: (dealId) => {
    const deal = MOCK_DEALS.find((d) => d._id === dealId); // eslint-disable-line no-underscore-dangle
    return deal;
  },
  queryDeals: () => MOCK_DEALS,
};