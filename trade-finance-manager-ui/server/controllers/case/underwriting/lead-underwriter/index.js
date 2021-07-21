import api from '../../../../api';
import CONSTANTS from '../../../../constants';
import mapAssignToSelectOptions from '../../../../helpers/map-assign-to-select-options';
import canUserEditLeadUnderwriter from './helpers';

const getLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  let currentLeadUnderWriter;
  let currentLeadUnderWriterUserId;

  if (deal.tfm.leadUnderwriter) {
    currentLeadUnderWriterUserId = deal.tfm.leadUnderwriter;
  }

  if (currentLeadUnderWriterUserId && currentLeadUnderWriterUserId !== CONSTANTS.TASKS.UNASSIGNED) {
    currentLeadUnderWriter = await api.getUser(currentLeadUnderWriterUserId);
  }

  const userCanEdit = canUserEditLeadUnderwriter(user);

  return res.render('case/underwriting/lead-underwriter/lead-underwriter.njk', {
    userCanEdit,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'lead underwriter',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    currentLeadUnderWriter,
  });
};

const getAssignLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const userCanEdit = canUserEditLeadUnderwriter(user);

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  let currentLeadUnderWriterUserId;

  if (deal.tfm.leadUnderwriter) {
    currentLeadUnderWriterUserId = deal.tfm.leadUnderwriter;
  }

  const allTeamMembers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITER_MANAGERS);

  return res.render('case/underwriting/lead-underwriter/assign-lead-underwriter.njk', {
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'lead underwriter',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user,
    assignToSelectOptions: mapAssignToSelectOptions(currentLeadUnderWriterUserId, user, allTeamMembers),
  });
};

const postAssignLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const userCanEdit = canUserEditLeadUnderwriter(user);

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
  } = req.body;

  const update = {
    userId: assignedToValue,
  };

  await api.updateLeadUnderwriter(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/lead-underwriter`);
};


export default {
  getLeadUnderwriter,
  getAssignLeadUnderwriter,
  postAssignLeadUnderwriter,
};
