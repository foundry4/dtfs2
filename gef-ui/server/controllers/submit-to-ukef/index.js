import { PROGRESS } from '../../../constants/index';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const MAX_COMMENT_LENGTH = 400;

const submitToUkef = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;
  try {
    return res.render('partials/submit-to-ukef.njk', {
      applicationId,
      maxCommentLength: MAX_COMMENT_LENGTH,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const createSubmissionToUkef = async (req, res, next) => {
  const { params, body } = req;
  const { userToken } = req.session;
  const { applicationId } = params;
  const { comment } = body;
  const application = await api.getApplication(applicationId);
  const checker = await api.getUserDetails(application.userId, userToken);

  // TODO : Add some validation here to make sure that the whole application is valid
  //    Cross check things like user allowed to access, bank it correct, etc
  //    If it is in an appropriate status to be submitted.
  //    Consider using an application model so that we have centralised place for reuse.
  try {
    if (comment.length > MAX_COMMENT_LENGTH) {
      const errors = validationErrorHandler({
        errRef: 'comment',
        errMsg: `You have entered more than ${MAX_COMMENT_LENGTH} characters`,
      });

      return res.render('partials/submit-to-ukef.njk', {
        applicationId,
        maxCommentLength: MAX_COMMENT_LENGTH,
        errors,
        comment,
      });
    }

    if (comment.length > 0) {
      const commentObj = {
        role: 'checker',
        userName: checker.username,
        createdAt: Date.now(),
        comment,
      };
      const comments = application.comments || [];
      comments.push(commentObj);
      application.comments = comments;
      await api.updateApplication(applicationId, application);
    }
    await api.setApplicationStatus(applicationId, PROGRESS.SUBMITTED_TO_UKEF);
    // TODO: Add a route and redirect instead of rendering?
    return res.render('partials/submit-to-ukef-confirmation.njk');
  } catch (err) {
    return next(err);
  }
};


export {
  submitToUkef,
  createSubmissionToUkef,
};
