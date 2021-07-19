const SME_TYPE = {
  MICRO: 'MICRO',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  NOT_SME: 'NOT_SME',
};

const FACILITY_TYPE = {
  CASH: 'CASH',
  CONTINGENT: 'CONTINGENT',
};

const PAYMENT_TYPE = {
  IN_ARREARS_QUARTLY: 'IN_ARREARS_QUARTLY',
  IN_ADVANCE_QUARTERLY: 'IN_ADVANCE_QUARTERLY',
};

const STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BANK_CHECK: 'BANK_CHECK',
};

const ERROR = {
  ENUM_ERROR: 'ENUM_ERROR',
  MANDATORY_FIELD: 'MANDATORY_FIELD',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  OVERSEAS_COMPANY: 'OVERSEAS_COMPANY',
};

const FACILITY_PROVIDED_DETAILS = {
  TERM: 'TERM',
  RESOLVING: 'RESOLVING',
  COMMITTED: 'COMMITTED',
  UNCOMMITTED: 'UNCOMMITTED',
  ON_DEMAND: 'ON_DEMAND',
  FACTORING: 'FACTORING',
  OTHER: 'OTHER',
};

const CURRENCY = {
  GBP: 'GBP',
  EUR: 'EUR',
  USD: 'USD',
  YEN: 'YEN',
};

module.exports = {
  SME_TYPE,
  FACILITY_TYPE,
  PAYMENT_TYPE,
  STATUS,
  ERROR,
  FACILITY_PROVIDED_DETAILS,
  CURRENCY,
};
