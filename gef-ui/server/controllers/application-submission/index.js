import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';
import { PROGRESS } from '../../../constants';

const maxCommentLength = 400;

export const getApplicationSubmission = (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  return res.render('application-details-comments.njk', { applicationId, maxCommentLength });
};

export const postApplicationSubmission = async (req, res, next) => {
  const { params, body } = req;
  const { userToken } = req.session;
  const { applicationId } = params;
  const { comment } = body;
  const application = await api.getApplication(applicationId);
  const maker = await api.getUserDetails(application.userId, userToken);

  // TODO : Add some validation here to make sure that the whole application is valid
  try {
    if (comment.length > maxCommentLength) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${maxCommentLength} characters`,
      });

      return res.render('application-details-comments.njk', {
        applicationId, maxCommentLength, errors, comment,
      });
    }
    if (comment) {
      const commentObj = {
        role: 'maker', userName: maker.username, createdAt: Date.now(), comment,
      };
      const comments = application.comments || [];
      comments.push(commentObj);

      application.comments = comments;
    }

    await api.updateApplication(applicationId, application);
    await api.setApplicationStatus(applicationId, PROGRESS.BANK_CHECK);
  } catch (err) {
    return next(err);
  }

  return res.render('application-details-submitted.njk', { applicationId });
};

export default {
  getApplicationSubmission,
  postApplicationSubmission,
};
