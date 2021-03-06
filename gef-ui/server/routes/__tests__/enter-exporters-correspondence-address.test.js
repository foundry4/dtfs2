import validateToken from '../middleware/validate-token';

const getSpy = jest.fn();
const postSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      get: getSpy,
      post: postSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../enter-exporters-correspondence-address');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId/enter-exporters-correspondence-address', validateToken, expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:applicationId/enter-exporters-correspondence-address', validateToken, expect.any(Function));
  });
});
