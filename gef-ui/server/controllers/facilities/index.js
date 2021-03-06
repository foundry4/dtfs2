import * as api from '../../services/api';
import { validationErrorHandler, isTrueSet } from '../../utils/helpers';
import { FACILITY_TYPE } from '../../../constants';

const facilities = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;
  let { facilityType } = query;

  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = FACILITY_TYPE[facilityType].toLowerCase();


  if (!facilityId) {
    return res.render('partials/facilities.njk', {
      facilityType: facilityTypeString,
      applicationId,
      status,
    });
  }

  try {
    const { details } = await api.getFacility(facilityId);
    const hasBeenIssued = JSON.stringify(details.hasBeenIssued);

    return res.render('partials/facilities.njk', {
      facilityType: facilityTypeString,
      hasBeenIssued: hasBeenIssued !== 'null' ? hasBeenIssued : null,
      applicationId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const createFacility = async (req, res) => {
  const { body, params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;
  let { facilityType } = query;
  const hasBeenIssuedErrors = [];
  let facility;
  facilityType = facilityType || FACILITY_TYPE.CASH;
  const facilityTypeString = FACILITY_TYPE[facilityType].toLowerCase();

  try {
    // Don't validate form if user clicks on 'return to application` button
    if (!body.hasBeenIssued) {
      hasBeenIssuedErrors.push({
        errRef: 'hasBeenIssued',
        errMsg: `Select if your bank has already issued this ${facilityTypeString} facility`,
      });

      return res.render('partials/facilities.njk', {
        errors: validationErrorHandler(hasBeenIssuedErrors),
        applicationId,
        status,
      });
    }

    if (!facilityId) {
      facility = await api.createFacility({
        type: facilityType,
        hasBeenIssued: isTrueSet(body.hasBeenIssued),
        applicationId,
      });
    } else {
      facility = await api.updateFacility(facilityId, {
        hasBeenIssued: isTrueSet(body.hasBeenIssued),
      });
    }

    if (status && status === 'change') {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }

    // eslint-disable-next-line no-underscore-dangle
    return res.redirect(`/gef/application-details/${applicationId}/facilities/${facility.details._id}/about-facility`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  facilities,
  createFacility,
};
