const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  const { legallyDistinct } = submissionDetails;

  if (legallyDistinct !== 'false' && legallyDistinct !== 'true') {
    newErrorList.legallyDistinct = {
      order: orderNumber(newErrorList),
      text: 'Guarantor/Indemnifier is required',
    };
  } else if (legallyDistinct === 'true') {
    if (!hasValue(submissionDetails['indemnifier-name'])) {
      newErrorList['indemnifier-name'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier name is required',
      };
    }

    if (!hasValue(submissionDetails['indemnifier-address-line-1'])) {
      newErrorList['indemnifier-address-line-1'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier address line 1 is required',
      };
    }

    if (!hasValue(submissionDetails['indemnifier-address-line-2'])) {
      newErrorList['indemnifier-address-line-2'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier address line 2 is required',
      };
    }

    if (!hasValue(submissionDetails['indemnifier-address-town'])) {
      newErrorList['indemnifier-address-town'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier town is required',
      };
    }

    // Cannot make county mandatory, as companies house does not provide a county field,
    //   so we would have validation failures for all addresses that come from CH lookup..
    //
    // if (!hasValue(submissionDetails['indemnifier-address-county'])) {
    //   newErrorList['indemnifier-address-county'] = {
    //     order: orderNumber(newErrorList),
    //     text: 'Indemnifier county is required',
    //   };
    // }

    if (!hasValue(submissionDetails['indemnifier-address-postcode'])) {
      newErrorList['indemnifier-address-postcode'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier postcode is required',
      };
    }

    if (!hasValue(submissionDetails['indemnifier-address-country'])) {
      newErrorList['indemnifier-address-country'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier country is required',
      };
    }
  }
  return newErrorList;
};
