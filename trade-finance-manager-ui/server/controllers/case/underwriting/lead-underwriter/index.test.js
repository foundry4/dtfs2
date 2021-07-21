/* eslint-disable no-underscore-dangle */
import api from '../../../../api';
import { mockRes } from '../../../../test-mocks';
import mapAssignToSelectOptions from '../../../../helpers/map-assign-to-select-options';
import underwriterLeadUnderwriterController from '.';
import canUserEditLeadUnderwriter from './helpers';

const res = mockRes();

const MOCK_USER_UNDERWRITER_MANAGER = {
  _id: '12345678',
  username: 'UNDERWRITER_MANAGER_1',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['UNDERWRITER_MANAGERS'],
};

const MOCK_USER_UNDERWRITER = {
  _id: '100200300',
  username: 'UNDERWRITER_1',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['UNDERWRITERS'],
};

const MOCK_TEAM_UNDERWRITER_MANAGERS = [
  MOCK_USER_UNDERWRITER_MANAGER,
];

const session = {
  user: MOCK_USER_UNDERWRITER_MANAGER,
};

const MOCK_DEAL = {
  _id: '1000023',
  dealSnapshot: {
    _id: '1000023',
    details: {
      submissionType: 'Manual Inclusion Application',
    },
  },
  tfm: {
    leadUnderwriter: '12345678910',
  },
};

const dealId = MOCK_DEAL._id;

describe('GET underwriting - lead underwriter', () => {
  const userCanEdit = canUserEditLeadUnderwriter(
    session.user,
  );

  describe('when deal exists', () => {
    const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCK_USER_UNDERWRITER_MANAGER));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCK_DEAL);
      api.getUser = apiGetUserSpy;
    });

    it('should render template with data', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
      };

      await underwriterLeadUnderwriterController.getLeadUnderwriter(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/lead-underwriter/lead-underwriter.njk', {
        userCanEdit,
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        activeSideNavigation: 'lead underwriter',
        deal: MOCK_DEAL.dealSnapshot,
        tfm: MOCK_DEAL.tfm,
        dealId: MOCK_DEAL.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        currentLeadUnderWriter: MOCK_USER_UNDERWRITER_MANAGER,
      });
    });

    it('should call getUser API to get current lead underwriter user data', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
        body: {
          assignedTo: '123-test',
        },
      };

      await underwriterLeadUnderwriterController.getLeadUnderwriter(req, res);

      expect(apiGetUserSpy).toHaveBeenCalledWith(MOCK_DEAL.tfm.leadUnderwriter);
    });
  });

  describe('when current lead underwriter is `Unassigned`', () => {
    const MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER = {
      dealSnapshot: MOCK_DEAL.dealSnapshot,
      tfm: {
        leadUnderwriter: 'Unassigned',
      },
    };

    const apiGetUserSpy = jest.fn(() => Promise.resolve({}));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER);
      api.getUser = apiGetUserSpy;
    });

    it('should NOT call getUser API or render currentLeadUnderWriter in template ', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
      };

      await underwriterLeadUnderwriterController.getLeadUnderwriter(req, res);

      expect(apiGetUserSpy).not.toHaveBeenCalled();

      expect(res.render).toHaveBeenCalledWith('case/underwriting/lead-underwriter/lead-underwriter.njk', {
        userCanEdit,
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        activeSideNavigation: 'lead underwriter',
        deal: MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER.dealSnapshot,
        tfm: MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER.tfm,
        dealId: MOCK_DEAL_UNASSIGNED_LEAD_UNDERWRITER.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        currentLeadUnderWriter: undefined,
      });
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await underwriterLeadUnderwriterController.getLeadUnderwriter(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('GET underwriting - assign lead underwriter', () => {
  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCK_DEAL);
      api.getUser = () => Promise.resolve(MOCK_USER_UNDERWRITER_MANAGER);
      api.getTeamMembers = () => Promise.resolve(MOCK_TEAM_UNDERWRITER_MANAGERS);
    });

    it('should render template with data', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
      };

      await underwriterLeadUnderwriterController.getAssignLeadUnderwriter(req, res);

      const expectedAssignToSelectOptions = mapAssignToSelectOptions(
        MOCK_DEAL.tfm.leadUnderwriter,
        session.user,
        MOCK_TEAM_UNDERWRITER_MANAGERS,
      );

      expect(res.render).toHaveBeenCalledWith('case/underwriting/lead-underwriter/assign-lead-underwriter.njk', {
        activeSubNavigation: 'underwriting',
        activeSideNavigation: 'lead underwriter',
        deal: MOCK_DEAL.dealSnapshot,
        tfm: MOCK_DEAL.tfm,
        dealId: MOCK_DEAL.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        assignToSelectOptions: expectedAssignToSelectOptions,
      });
    });
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session: {
          user: MOCK_USER_UNDERWRITER,
        },
      };

      await underwriterLeadUnderwriterController.getAssignLeadUnderwriter(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await underwriterLeadUnderwriterController.getAssignLeadUnderwriter(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - assign lead underwriter', () => {
  const apiUpdateSpy = jest.fn(() => Promise.resolve({
    test: true,
  }));

  beforeEach(() => {
    api.getDeal = () => Promise.resolve(MOCK_DEAL);
    api.updateLeadUnderwriter = apiUpdateSpy;
  });

  it('should call updateLeadUnderwriter API and redirect to /lead-underwriter', async () => {
    const req = {
      params: {
        _id: dealId,
      },
      session,
      body: {
        assignedTo: '123-test',
      },
    };

    await underwriterLeadUnderwriterController.postAssignLeadUnderwriter(req, res);

    const expectedUpdateObj = {
      userId: req.body.assignedTo,
    };

    expect(apiUpdateSpy).toHaveBeenCalledWith(
      MOCK_DEAL._id,
      expectedUpdateObj,
    );
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session: {
          user: MOCK_USER_UNDERWRITER,
        },
      };

      await underwriterLeadUnderwriterController.postAssignLeadUnderwriter(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when deal does NOT exist', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve();
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session,
      };

      await underwriterLeadUnderwriterController.postAssignLeadUnderwriter(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
