import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.render('login.njk'));

router.post('/', (req, res) =>
  res.redirect('/case/deal/1000677'));

export default router;
