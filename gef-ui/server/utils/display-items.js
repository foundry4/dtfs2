import moment from 'moment';
import { SME_TYPE, BOOLEAN, STAGE } from '../../constants';

const exporterItems = (exporterUrl) => [
  {
    label: 'Companies House registration number',
    id: 'companiesHouseRegistrationNumber',
    href: `${exporterUrl}/companies-house?status=change`,
  },
  {
    label: 'Company name',
    id: 'companyName',
  },
  {
    label: 'Registered Address',
    id: 'registeredAddress',
  },
  {
    label: 'Correspondence address, if different',
    id: 'correspondenceAddress',
    href: `${exporterUrl}/enter-exporters-correspondence-address?status=change`,
  },
  {
    label: 'Industry',
    id: 'industries',
    isIndustry: true,
  },
  {
    label: 'SME type',
    id: 'smeType',
    href: `${exporterUrl}/about-exporter?status=change`,
    method: (callback) => SME_TYPE[callback],
  },
  {
    label: 'Probability of default',
    id: 'probabilityOfDefault',
    href: `${exporterUrl}/about-exporter?status=change`,
    suffix: '%',
  },
  {
    label: 'Is finance for this exporter increasing?',
    id: 'isFinanceIncreasing',
    href: `${exporterUrl}/about-exporter?status=change`,
    method: (callback) => (callback === 'true' ? BOOLEAN.YES : BOOLEAN.NO),
  },
];

const facilityItems = (exporterUrl, type) => [
  {
    label: 'Name',
    id: 'name',
    href: `${exporterUrl}/`,
  },
  {
    label: 'Stage',
    id: 'hasBeenIssued',
    href: `${exporterUrl}/`,
    method: (callback) => (callback ? STAGE.ISSUED : STAGE.UNISSUED),
  },
  {
    label: 'Cover start date',
    id: 'coverStartDate',
    href: `${exporterUrl}/`,
    method: (callback) => moment(callback).format('D MMMM YYYY'),
  },
  {
    label: 'Cover end date',
    id: 'coverEndDate',
    href: `${exporterUrl}/`,
    method: (callback) => moment(callback).format('D MMMM YYYY'),
  },
  {
    label: 'Months the UKEF guarantee will be in place for',
    id: 'monthsOfCover',
    href: `${exporterUrl}/`,
    suffix: ' months',
  },
  {
    label: 'Facility provided on',
    id: 'details',
    href: `${exporterUrl}/`,
  },
  {
    label: 'Facility value',
    id: 'value',
    href: `${exporterUrl}/`,
    isCurrency: true,
  },
  {
    label: 'Percentage of UKEF cover needed',
    id: 'coverPercentage',
    href: `${exporterUrl}/`,
    suffix: '%',
  },
  {
    label: 'Your bank’s maximum liability',
    id: 'banksMaximumLiability',
    href: `${exporterUrl}/`,
    isCurrency: true,
  },
  {
    label: 'UKEF’s maximum liability',
    id: 'ukefMaximumLiability',
    href: `${exporterUrl}/`,
    isCurrency: true,
  },
  {
    label: type === 0 ? 'Interest margin your bank will charge' : 'Risk margin your bank will charge',
    id: 'interestPercentage',
    href: `${exporterUrl}/`,
    suffix: '%',
  },
];

export {
  exporterItems,
  facilityItems,
};
