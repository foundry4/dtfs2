import express from 'express';
import {
  getApiData,
  requestParams,
} from '../../helpers';
import api from '../../api';
import buildReportFilters from '../buildReportFilters';
import { getExpiryDates } from '../expiryStatusUtils';

const PAGESIZE = 20;
const primaryNav = 'reports';
const router = express.Router();

router.get('/reports/mia-to-be-submitted/with-conditions/:page', async (req, res) => {
  // TODO wire up getMIAData function
  const filterByDealStatus = 'Accepted by UKEF (with conditions)';
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;


  const submissionFilters = {
    filterBySubmissionType: 'manualInclusionApplication',
  };

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const MIAfilters = buildReportFilters(submissionFilters, req.session.user);
  const applications = await getApiData(
    api.contracts(0, 0, MIAfilters, userToken),
    res,
  );

  let miaWithConditions = [];
  let tempDeals = [];
  let deals = [];
  let count = 0;
  if (applications.deals) {
    miaWithConditions = applications.deals.filter((deal) => (deal.details.status === filterByDealStatus));
    tempDeals = getExpiryDates(miaWithConditions, workingDays, true);
    // once we have the deals and expiry dates, filter the display
    if (fromDays > 0) {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays >= fromDays && deal.remainingDays <= toDays,
      );
    } else {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays <= toDays,
      );
    }
    count = deals.length;
  }

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  const sortOrder = {
    queryString: `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}&sort=desc`,
    order: 'ascending',
    image: 'twistie-up',
  };

  // default order from getExpiryDates is asc
  if (req.query && req.query.sort && req.query.sort === 'desc') {
    if (deals) {
      deals.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    }
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }
  return res.render('reports/MIA-to-be-submitted-report.njk', {
    pages,
    conditions: 'with',
    deals,
    banks,
    sortOrder,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});


router.post('/reports/mia-to-be-submitted/with-conditions/:page', async (req, res) => {
  // TODO wire up getMIAData function
  const filterByDealStatus = 'Accepted by UKEF (with conditions)';
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;

  const submissionFilters = req.body;
  if (submissionFilters.bank === 'any') {
    submissionFilters.bank = '';
  }
  submissionFilters.filterBySubmissionType = 'manualInclusionApplication';

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const MIAfilters = buildReportFilters(submissionFilters, req.session.user);
  const applications = await getApiData(
    api.contracts(0, 0, MIAfilters, userToken),
    res,
  );

  let miaWithConditions = [];
  let tempDeals = [];
  let deals = [];
  let count = 0;
  if (applications.deals) {
    miaWithConditions = applications.deals.filter((deal) => (deal.details.status === filterByDealStatus));
    tempDeals = getExpiryDates(miaWithConditions, workingDays, true);
    // once we have the deals and expiry dates, filter the display
    if (fromDays > 0) {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays >= fromDays && deal.remainingDays <= toDays,
      );
    } else {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays <= toDays,
      );
    }
    count = deals.length;
  }

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  const sortOrder = {
    queryString: `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}&sort=desc`,
    order: 'ascending',
    image: 'twistie-up',
  };

  // default order from getExpiryDates is asc
  if (req.query && req.query.sort && req.query.sort === 'desc') {
    if (deals) {
      deals.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    }
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }
  return res.render('reports/MIA-to-be-submitted-report.njk', {
    pages,
    conditions: 'with',
    deals,
    filter: {
      ...submissionFilters,
    },
    banks,
    sortOrder,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});

export default router;
