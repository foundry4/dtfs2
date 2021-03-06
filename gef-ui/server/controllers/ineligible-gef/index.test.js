import ineligibleGef from './index';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Mandatory Criteria', () => {
  it('renders the `ineligible for GEF` template', async () => {
    const mockResponse = new MockResponse();
    await ineligibleGef({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/ineligible-gef.njk');
  });
});
