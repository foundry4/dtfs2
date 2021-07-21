/* eslint-disable no-underscore-dangle */
import _startCase from 'lodash/startCase';
import * as api from '../../services/api';
import {
  getApplicationType, mapSummaryList, status,
} from '../../utils/helpers';
import { coverItems, exporterItems, facilityItems } from '../../utils/display-items';
import { FACILITY_TYPE, PROGRESS } from '../../../constants';

const applicationPreview = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  const { userToken } = req.session;

  function isApplicationComplete(exporter, coverTerms, facilities) {
    return status[exporter.status || PROGRESS.NOT_STARTED].code === PROGRESS.COMPLETED
      && status[coverTerms.status || PROGRESS.NOT_STARTED].code === PROGRESS.COMPLETED
      && status[facilities.status || PROGRESS.NOT_STARTED].code === PROGRESS.COMPLETED;
  }

  try {
    const {
      bankInternalRefName,
      exporterId,
      coverTermsId,
      createdAt,
      comments,
      userId,
    } = await api.getApplication(applicationId);
    // TODO DTFS2-???? api.getApplicationPreviewDetails(applicationId) to combine the multiple calls.
    const exporter = await api.getExporter(exporterId);
    const coverTerms = await api.getCoverTerms(coverTermsId);
    const facilities = await api.getFacilities(applicationId);

    if (!isApplicationComplete(exporter, coverTerms, facilities)) {
      return res.redirect('/dashboard/0');
    }

    const maker = await api.getUserDetails(userId, userToken);
    return res.render('partials/application-preview.njk', {
      dealId: '-',
      companyName: exporter.details.companyName,
      dateCreated: createdAt,
      timezone: maker.timezone || 'UTC',
      createdBy: `${maker.firstname} ${maker.surname}`,
      comments,
      checkedBy: 'DTFS2-????',
      isAutomaticCover: coverTerms.isAutomaticCover,
      applicationType: getApplicationType(coverTerms.isAutomaticCover),
      cashFacilitiesCount: facilities.items.filter((item) => item.details.type === 'CASH').length,
      contingentFacilitiesCount: facilities.items.filter((item) => item.details.type === 'CONTINGENT').length,
      exporter: {
        rows: mapSummaryList(exporter, exporterItems('#', {
          showIndustryChangeLink: exporter.details.industries && exporter.details.industries.length > 1,
        }), true),
      },
      coverTerms: {
        rows: mapSummaryList(coverTerms, coverItems('#')),
      },
      facilities: {
        data: facilities.items.map((item) => ({
          heading: _startCase(FACILITY_TYPE[item.details.type].toLowerCase()),
          rows: mapSummaryList(item, facilityItems('#', item.details), true),
          createdAt: item.details.createdAt,
          facilityId: item.details._id,
        }))
          .sort((a, b) => b.createdAt - a.createdAt), // latest facility appears at top
      },
      bankInternalRefName,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default applicationPreview;
