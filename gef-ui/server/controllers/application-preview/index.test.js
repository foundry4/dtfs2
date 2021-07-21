import applicationPreview from './index';
import * as api from '../../services/api';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.session = { userToken: 'dummy-token' };
  req.params.applicationId = '123';
  return req;
};

const MockApplicationResponse = () => {
  const res = {};
  res.exporterId = '123';
  res.coverTermsId = '123';
  res.bankInternalRefName = 'My test';
  res.comments = [{
    role: 'maker',
    userName: 'Test User',
    createdAt: '1625482095783',
    comment: 'The client needs this asap.',
  }, {
    role: 'checker',
    userName: 'James Bysouth',
    createdAt: '1625482095983',
    comment: 'I have some questions.',
  }];
  return res;
};

const MockExporterResponse = () => {
  const res = {};
  res.details = {};
  res.validation = {};
  res.details.companiesHouseRegistrationNumber = 'tedsi';
  res.validation.required = [];
  res.status = 'COMPLETED';
  return res;
};

const MockCoverTermsResponse = () => {
  const res = {};
  res.details = {};
  res.validation = {};
  res.validation.required = [];
  res.data = [];
  res.status = 'COMPLETED';
  return res;
};

const MockFacilityResponse = () => {
  const res = {};
  res.data = [];
  res.status = 'COMPLETED';
  return res;
};

const MockMakerUserResponse = () => ({ firstName: 'first', surname: 'surname', timezone: 'Europe/London' });

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Application Preview', () => {
  it('renders the `Application Preview` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();
    const mockFacilityResponse = new MockFacilityResponse();
    const mockMakerUserResponse = new MockMakerUserResponse();

    mockFacilityResponse.items = [{ details: { type: 'CASH' }, validation: { required: [] } }];
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    api.getFacilities = () => Promise.resolve(mockFacilityResponse);
    api.getUserDetails = () => Promise.resolve(mockMakerUserResponse);
    await applicationPreview(mockRequest, mockResponse);
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/application-preview.njk', expect.objectContaining({
        bankInternalRefName: 'My test',
        exporter: {
          rows: expect.any(Array),
        },
        coverTerms: {
          rows: expect.any(Array),
        },
        facilities: {
          data: expect.any(Array),
        },
        comments: expect.any(Array),
        createdBy: expect.any(String),
      }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getApplication = () => Promise.reject();
    await applicationPreview(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
