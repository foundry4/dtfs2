const { findOneDeal, update: updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { getEligibilityErrors, getCriteria11Errors } = require('../validation/eligibility-criteria');
const { getDocumentationErrors } = require('../validation/eligibility-documentation');

exports.update = async (req, res) => {
  await findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    }

    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }


      const { eligibility: { criteria }, dealFiles = {} } = deal;
      let criteriaComplete = true;

      const updatedCriteria = criteria.map((c) => {
        if (typeof req.body[`criterion-${c.id}`] === 'undefined') {
          criteriaComplete = false;
          return c;
        }

        return {
          ...c,
          answer: req.body[`criterion-${c.id}`].toLowerCase() === 'true',
        };
      });

      const validationErrors = getEligibilityErrors(updatedCriteria);
      const documentationErrors = getDocumentationErrors(updatedCriteria, dealFiles);

      // Special case for criteria 11 - must add agents name & address if criteria 11 === false
      const criteria11 = updatedCriteria.find((c) => c.id === 11);

      const criteria11IsFalse = (typeof criteria11.answer !== 'undefined' && criteria11.answer === false);

      const criteria11Additional = {
        agentName: criteria11IsFalse && req.body['agent-name'] ? req.body['agent-name'].substring(0, 150) : '',
        agentCountry: criteria11IsFalse ? req.body['agent-country'] : '',
        agentAddress1: criteria11IsFalse ? req.body['agent-address-line-1'] : '',
        agentAddress2: criteria11IsFalse ? req.body['agent-address-line-2'] : '',
        agentAddress3: criteria11IsFalse ? req.body['agent-address-line-3'] : '',
        agentTown: criteria11IsFalse ? req.body['agent-address-town'] : '',
        agentPostcode: criteria11IsFalse ? req.body['agent-postcode'] : '',
      };

      const criteria11ValidationErrors = getCriteria11Errors(criteria11Additional, criteria11IsFalse);

      validationErrors.count += criteria11ValidationErrors.count;
      validationErrors.errorList = {
        ...criteria11ValidationErrors.errorList,
        ...validationErrors.errorList,
      };

      const updatedDeal = {
        ...deal,
        eligibility: {
          status: criteriaComplete ? 'Complete' : 'Incomplete',
          criteria: updatedCriteria,
          ...criteria11Additional,
          validationErrors,
        },
        dealFiles: {
          ...dealFiles,
          validationErrors: documentationErrors,
        },
      };

      const newReq = {
        params: req.params,
        body: updatedDeal,
        user: req.user,
      };

      updateDeal(newReq, res);
    }
  });
};
