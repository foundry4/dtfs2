import { submitToUkef, createSubmissionToUkef } from './index';
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
  req.body = { comment: '' };
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
  }];
  return res;
};

const MockMakerUserResponse = () => ({
  firstName: 'first',
  surname: 'surname',
  timezone: 'Europe/London',
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('create submission to UKEF', () => {
  const mockResponse = new MockResponse();
  const mockRequest = new MockRequest();
  const mockApplicationResponse = new MockApplicationResponse();
  const mockMakerUserResponse = new MockMakerUserResponse();
  api.getApplication = () => Promise.resolve(mockApplicationResponse);
  api.getUserDetails = () => Promise.resolve(mockMakerUserResponse);
  api.updateApplication = () => Promise.resolve(mockApplicationResponse);
  api.setApplicationStatus = () => Promise.resolve(mockApplicationResponse);

  it('redirects to submission url', async () => {
    await createSubmissionToUkef(mockRequest, mockResponse);
    // TODO: Consider using redirect instead of render.
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/submit-to-ukef-confirmation.njk');
  });

  it('renders an error when the comment is over the maximum length', async () => {
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getUserDetails = () => Promise.resolve(mockMakerUserResponse);
    api.updateApplication = () => Promise.resolve(mockApplicationResponse);

    const longComments = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at ante nec magna fringilla 
    dapibus. Praesent porta nibh at metus venenatis feugiat. Proin vel sollicitudin ligula. Nulla sed massa quis 
    augue bibendum lacinia vitae id leo. Aliquam quis imperdiet felis, et tempus eros. Duis efficitur odio nisl, 
    non finibus urna convallis sit amet. Cras tortor odio, finibus in fermentum vel, posuere quis.`;
    mockRequest.body.comment = longComments;

    await createSubmissionToUkef(mockRequest, mockResponse);

    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/submit-to-ukef.njk', expect.objectContaining({
        applicationId: expect.any(String),
        comment: longComments,
        maxCommentLength: expect.any(Number),
        errors: expect.any(Object),
      }));
  });
});

describe('Submit to UKEF', () => {
  it('renders the page as expected', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    await submitToUkef(mockRequest, mockResponse);

    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/submit-to-ukef.njk',
        expect.objectContaining({
          applicationId: expect.any(String),
          maxCommentLength: expect.any(Number),
        }));
  });
});
