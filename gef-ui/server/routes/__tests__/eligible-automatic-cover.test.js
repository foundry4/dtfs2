import validateToken from '../middleware/validate-token';

const getSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      get: getSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../eligible-automatic-cover');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId/eligible-automatic-cover', validateToken, expect.any(Function));
  });
});
