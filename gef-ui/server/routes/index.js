import express from 'express';
import mandatoryCriteriaRoutes from './mandatory-criteria';
import nameApplicationRoutes from './name-application';
import applicationDetailsRoutes from './application-details';
import applicationSubmissionRoutes from './application-submission';
import applicationPreviewRoutes from './application-preview';
import submitToUkefRoutes from './submit-to-ukef';
import ineligibleGefRoutes from './ineligible-gef';
import eligibleAutomaticCoverRoutes from './eligible-automatic-cover';
import ineligibleAutomaticCoverRoutes from './ineligible-automatic-cover';
import automaticCoverRoutes from './automatic-cover';
import companiesHouseRoutes from './companies-house';
import exportersAddressRoutes from './exporters-address';
import selectExportersCorrespondenceAddressRoutes from './select-exporters-correspondence-address';
import enterExportersCorrespondenceAddressRoutes from './enter-exporters-correspondence-address';
import aboutExporterRoutes from './about-exporter';
import facilitiesRoutes from './facilities';
import aboutFacilityRoutes from './about-facility';
import providedFacilityRoutes from './provided-facility';
import facilityCurrencyRoutes from './facility-currency';
import facilityValueRoutes from './facility-value';
import facilityConfirmDeletionRoutes from './facility-confirm-deletion';

const router = express.Router();

router.use(mandatoryCriteriaRoutes);
router.use(nameApplicationRoutes);
router.use(ineligibleGefRoutes);
router.use(eligibleAutomaticCoverRoutes);
router.use(ineligibleAutomaticCoverRoutes);
router.use(applicationDetailsRoutes);
router.use(applicationSubmissionRoutes);
router.use(applicationPreviewRoutes);
router.use(submitToUkefRoutes);
router.use(automaticCoverRoutes);
router.use(companiesHouseRoutes);
router.use(exportersAddressRoutes);
router.use(selectExportersCorrespondenceAddressRoutes);
router.use(enterExportersCorrespondenceAddressRoutes);
router.use(aboutExporterRoutes);
router.use(facilitiesRoutes);
router.use(aboutFacilityRoutes);
router.use(providedFacilityRoutes);
router.use(facilityCurrencyRoutes);
router.use(facilityValueRoutes);
router.use(facilityConfirmDeletionRoutes);

export default router;
