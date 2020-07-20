import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const router = express.Router();

router.get('/:_id', async (req, res) => {
  const { userToken } = requestParams(req);

  const { _id } = req.session.user;

  const user = await getApiData(
    api.user(_id, userToken),
    res,
  );

  return res.render('user/profile.njk',
    {
      _id,
      user,
    });
});

router.get('/:_id/change-password', async (req, res) => {
  const { _id } = requestParams(req);

  return res.render('user/change-password.njk',
    {
      _id,
      user: req.session.user,
    });
});

export default router;
