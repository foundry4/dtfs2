import {
  getApplicationSubmission,
  postApplicationSubmission,
} from './index';
import * as api from '../../services/api';
import { PROGRESS } from '../../../constants';

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
  req.params.applicationId = '1234';
  return req;
};

const MockSubmissionRequest = () => ({
  params: {
    applicationId: '1234',
  },
  query: {},
  body: {
    comment: 'Some comments here',
  },
  session: {
    userToken: '',
  },
});

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.coverTermsId = '123';
  res.bankInternalRefName = 'My test';
  return res;
};

const MockUserResponse = () => ({
  username: 'maker',
});

describe('GET Application Submission', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders submission page as expected', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    getApplicationSubmission(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('application-details-comments.njk', expect.objectContaining({
      applicationId: expect.any(String),
      maxCommentLength: expect.any(Number),
    }));
  });
});

describe('POST Application Submission', () => {
  const mockResponse = new MockResponse();
  const mockRequest = new MockSubmissionRequest();
  const mockUserResponse = new MockUserResponse();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders confirmation if successfully submitted', async () => {
    const mockApplicationResponse = new MockApplicationResponse();

    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.updateApplication = () => Promise.resolve({});
    api.setApplicationStatus = () => Promise.resolve({});

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('application-details-submitted.njk', expect.objectContaining({
      applicationId: expect.any(String),
    }));
  });

  it('renders error where comments are too long', async () => {
    const longComments = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at ante nec magna fringilla dapibus. Praesent porta nibh at metus venenatis feugiat. Proin vel sollicitudin ligula. Nulla sed massa quis augue bibendum lacinia vitae id leo. Aliquam quis imperdiet felis, et tempus eros. Duis efficitur odio nisl, non finibus urna convallis sit amet. Cras tortor odio, finibus in fermentum vel, posuere quis.';
    mockRequest.body.comment = longComments;

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('application-details-comments.njk', expect.objectContaining({
      applicationId: expect.any(String),
      comment: longComments,
      maxCommentLength: expect.any(Number),
      errors: expect.any(Object),
    }));
  });

  it('adds a comment to the application when the user enters one', async () => {
    const mockApplicationResponse = new MockApplicationResponse();
    api.updateApplication = jest.fn();
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getUserDetails = () => Promise.resolve(mockUserResponse);
    api.setApplicationStatus = () => Promise.resolve({});
    mockRequest.body.comment = 'Some comments here';

    const expected = {
      ...mockApplicationResponse,
      ...{
        comments: [{
          role: 'maker', userName: 'maker', createdAt: expect.any(Number), comment: mockRequest.body.comment,
        }],
      },
    };

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(api.updateApplication).toHaveBeenCalledWith(mockApplicationResponse._id, expected);
  });

  it('doesnt add a comment to the application when the user doesnt enter one', async () => {
    const mockApplicationResponse = new MockApplicationResponse();
    api.updateApplication = jest.fn();
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getUserDetails = () => Promise.resolve(mockUserResponse);
    mockRequest.body.comment = '';

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(api.updateApplication).toHaveBeenCalledWith(mockApplicationResponse._id, mockApplicationResponse);
  });

  it('updates the application status to `BANK_CHECK`', async () => {
    const mockApplicationResponse = new MockApplicationResponse();
    api.updateApplication = () => Promise.resolve({});
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getUserDetails = () => Promise.resolve(mockUserResponse);
    api.setApplicationStatus = jest.fn();
    mockRequest.body.comment = '';

    await postApplicationSubmission(mockRequest, mockResponse);

    expect(api.setApplicationStatus).toHaveBeenCalledWith(mockApplicationResponse._id, PROGRESS.BANK_CHECK);
  });
});
