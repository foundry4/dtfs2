import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const router = express.Router();

router.get('/users', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const userList = await getApiData(
    api.users(userToken),
    res,
  );

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  return res.render('admin/dashboard.njk',
    {
      _id,
      users: userList.users,
      banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
      user: req.session.user,
    });
});

router.get('/users/create', async (req, res) => {
  const { userToken } = requestParams(req);

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  return res.render('admin/user-edit.njk',
    {
      banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
      user: req.session.user,
      displayedUser: { roles: [] },
    });
});

// fix up data from create user page..
//-----
// roles are fed in from checkboxes, so we either get a string or an array..
// -so if we don't get an array, put it into an array..
const fixRolesIntoArray = (userObject) => ({
  ...userObject,
  roles: Array.isArray(userObject.roles) ? userObject.roles : [userObject.roles],
});

router.post('/users/create', async (req, res) => {
  const { userToken } = requestParams(req);

  const userToCreate = fixRolesIntoArray({ ...req.body });

  // inflate the bank object
  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const selectedBank = banks.find((bank) => bank.id === userToCreate.bank);
  userToCreate.bank = selectedBank;

  // rename email->username.. not sure which it should be but we currently care about username..
  userToCreate.username = userToCreate.email;

  //------

  await api.createUser(userToCreate, userToken);

  return res.redirect('/admin/users/');
  //
  //
  //
  // return res.render('admin/user-edit.njk',
  //   {
  //     banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
  //     user: req.session.user,
  //   });
});

router.get('/users/edit/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { user } = req.session;

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const userToEdit = await getApiData(
    api.user(_id, userToken),
    res,
  );

  return res.render('admin/user-edit.njk',
    {
      _id,
      banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
      displayedUser: userToEdit,
      user,
    });
});

router.post('/users/edit/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const update = fixRolesIntoArray({ ...req.body });

  console.log(`update:: ${JSON.stringify(update)}`);

  await api.updateUser(_id, update, userToken);

  return res.redirect('/admin/users');
  // const banks = await getApiData(
  //   api.banks(userToken),
  //   res,
  // );
  //
  // const userToEdit = await getApiData(
  //   api.user(_id, userToken),
  //   res,
  // );

  // return res.render('admin/user-edit.njk',
  //   {
  //     _id,
  //     banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
  //     displayedUser: userToEdit,
  //     user,
  //   });
});

router.get('/users/disable/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(
    api.user(_id, userToken),
    res,
  );

  return res.render('admin/user-disable.njk',
    {
      _id,
      user,
    });
});

router.get('/users/enable/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(
    api.user(_id, userToken),
    res,
  );

  return res.render('admin/user-enable.njk',
    {
      _id,
      user,
    });
});


router.get('/users/change-password/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const user = await getApiData(
    api.user(_id, userToken),
    res,
  );

  return res.render('admin/user-change-password.njk',
    {
      _id,
      user,
    });
});

export default router;
