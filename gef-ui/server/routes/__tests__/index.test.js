import mandatoryCriteriaRoutes from '../mandatory-criteria';
import nameApplicationRoutes from '../name-application';
import ineligibleGefRoutes from '../ineligible-gef';
import eligibleAutomaticCoverRoutes from '../eligible-automatic-cover';
import ineligibleAutomaticCoverRoutes from '../ineligible-automatic-cover';
import automaticCoverRoutes from '../automatic-cover';
import applicationDetailsRoutes from '../application-details';
import applicationSubmissionRoutes from '../application-submission';
import submitToUkefRoutes from '../submit-to-ukef';
import applicationPreviewRoutes from '../application-preview';
import companiesHouseRoutes from '../companies-house';
import exportersAddressRoutes from '../exporters-address';
import enterExportersCorrespondenceAddressRoutes from '../enter-exporters-correspondence-address';
import selectExportersCorrespondenceAddressRoutes from '../select-exporters-correspondence-address';
import aboutExporter from '../about-exporter';
import facilities from '../facilities';
import aboutFacility from '../about-facility';
import providedFacility from '../provided-facility';
import facilityCurrency from '../facility-currency';
import facilityValue from '../facility-value';
import facilityConfirmDeletion from '../facility-confirm-deletion';

const useSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      use: useSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../index');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup all routes', () => {
    expect(useSpy).toHaveBeenCalledWith(mandatoryCriteriaRoutes);
    expect(useSpy).toHaveBeenCalledWith(nameApplicationRoutes);
    expect(useSpy).toHaveBeenCalledWith(ineligibleGefRoutes);
    expect(useSpy).toHaveBeenCalledWith(eligibleAutomaticCoverRoutes);
    expect(useSpy).toHaveBeenCalledWith(ineligibleAutomaticCoverRoutes);
    expect(useSpy).toHaveBeenCalledWith(automaticCoverRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationDetailsRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationSubmissionRoutes);
    expect(useSpy).toHaveBeenCalledWith(submitToUkefRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationPreviewRoutes);
    expect(useSpy).toHaveBeenCalledWith(companiesHouseRoutes);
    expect(useSpy).toHaveBeenCalledWith(exportersAddressRoutes);
    expect(useSpy).toHaveBeenCalledWith(enterExportersCorrespondenceAddressRoutes);
    expect(useSpy).toHaveBeenCalledWith(selectExportersCorrespondenceAddressRoutes);
    expect(useSpy).toHaveBeenCalledWith(aboutExporter);
    expect(useSpy).toHaveBeenCalledWith(facilities);
    expect(useSpy).toHaveBeenCalledWith(aboutFacility);
    expect(useSpy).toHaveBeenCalledWith(providedFacility);
    expect(useSpy).toHaveBeenCalledWith(facilityCurrency);
    expect(useSpy).toHaveBeenCalledWith(facilityValue);
    expect(useSpy).toHaveBeenCalledWith(facilityConfirmDeletion);
  });
});
