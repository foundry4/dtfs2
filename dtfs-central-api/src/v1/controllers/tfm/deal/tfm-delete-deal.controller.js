const { findOneDeal } = require('./tfm-get-deal.controller');
const db = require('../../../../drivers/db-client');

exports.deleteDeal = async (req, res) => {
  findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      const collection = await db.getCollection('tfm-deals');
      const facilitiesCollection = await db.getCollection('tfm-facilities');
      const status = await collection.deleteOne({ _id: req.params.id });
      // eslint-disable-next-line no-underscore-dangle
      await facilitiesCollection.deleteMany({ facilitySnapshot: { associatedDealId: deal._id } });
      return res.status(200).send(status);
    }

    return res.status(404).send();
  });
};
