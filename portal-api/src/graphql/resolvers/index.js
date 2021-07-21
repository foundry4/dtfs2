
const queryAllDeals = require('./query-all-deals');
const queryDeals = require('./query-deals');
const queryTransactions = require('./query-transactions');
const queryGefDeals = require('./query-gef-deals');

const resolvers = {
  Query: {
    allDeals: queryAllDeals,
    deals: queryDeals,
    gefDeals: queryGefDeals,
    transactions: queryTransactions,
  },
};

module.exports = resolvers;
