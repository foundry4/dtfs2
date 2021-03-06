const { ObjectID } = require('mongodb');
const assert = require('assert');
const moment = require('moment');
require('moment-timezone');// monkey-patch to provide moment().tz()

const db = require('../../drivers/db-client');
const validateFeedback = require('../validation/feedback');
const now = require('../../now');
const sendEmail = require('../email');

const findFeedbacks = async (callback) => {
  const collection = await db.getCollection('feedback');

  collection.find({}).toArray((err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

const findOneFeedback = async (id, callback) => {
  const collection = await db.getCollection('feedback');

  collection.findOne({ _id: new ObjectID(id) }, (err, result) => {
    assert.equal(err, null);
    callback(result);
  });
};

exports.create = async (req, res) => {
  const validationErrors = validateFeedback(req.body);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      feedback: req.body,
      validationErrors,
    });
  }

  const modifiedFeedback = {
    ...req.body,
    submittedBy: req.user.username,
    created: now(),
  };

  const collection = await db.getCollection('feedback');
  const response = await collection.insertOne(modifiedFeedback);

  const createdFeedback = response.ops[0];

  // get formatted date from created timestamp, to display in email
  const targetTimezone = req.user.timezone;
  const utc = moment(parseInt(modifiedFeedback.created, 10));
  const localisedTimestamp = utc.tz(targetTimezone);
  const formattedCreated = localisedTimestamp.format('DD/MM/YYYY HH:mm');

  const {
    role,
    organisation,
    reasonForVisiting,
    reasonForVisitingOther,
    easyToUse,
    clearlyExplained,
    satisfied,
    howCanWeImprove,
    submittedBy,
    emailAddress,
  } = modifiedFeedback;

  const emailVariables = {
    role,
    organisation,
    reasonForVisiting,
    reasonForVisitingOther,
    easyToUse,
    clearlyExplained,
    satisfied,
    howCanWeImprove,
    submittedBy,
    emailAddress,
    created: formattedCreated,
  };

  const EMAIL_TEMPLATE_ID = '4214bdb8-b3f5-4081-a664-3bfcfe648b8d';
  const EMAIL_RECIPIENT = process.env.GOV_NOTIFY_EMAIL_RECIPIENT;

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    EMAIL_RECIPIENT,
    emailVariables,
  );

  return res.status(200).send(createdFeedback);
};

exports.findOne = (req, res) => (
  findOneFeedback(req.params.id, (feedback) => {
    if (!feedback) {
      res.status(404).send();
    } else {
      return res.status(200).send(feedback);
    }
    return res.status(404).send();
  })
);

exports.findAll = (req, res) => (
  findFeedbacks((feedbacks) => res.status(200).send(feedbacks)));

exports.delete = async (req, res) => {
  findOneFeedback(req.params.id, async (feedback) => {
    if (!feedback) {
      return res.status(404).send();
    }
    const collection = await db.getCollection('feedback');
    const status = await collection.deleteOne({ _id: new ObjectID(req.params.id) });
    return res.status(200).send(status);
  });
};
