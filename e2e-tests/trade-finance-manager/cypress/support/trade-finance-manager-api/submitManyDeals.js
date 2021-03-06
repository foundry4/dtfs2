const { submitDeal } = require('./api');

module.exports = (deals) => {
  console.log('submitManyDeals::');
  const persistedDeals = [];

  deals.forEach((dealToInsert) => {
    submitDeal(dealToInsert._id).then((deal) => {
      persistedDeals.push(deal);

      if (persistedDeals.length === deals.length) {
        return persistedDeals;
      }
    });
  });
};
