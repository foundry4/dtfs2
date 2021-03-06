const { issuedFacilities } = require('./issued-facilities');
const CONSTANTS = require('../../constants');

const issuedBond = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const issuedLoan = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const unissuedBond = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

const unissuedLoan = {
  facilityStage: CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL,
  'coverEndDate-year': '2024',
  'coverEndDate-month': '05',
  'coverEndDate-day': '21',
};

describe('return list of issued & unissued facilities', () => {
  describe('without facilitySnapshot', () => {
    let dealSnapshot;
    beforeAll(() => {
      dealSnapshot = {
        bondTransactions: {
          items: [issuedBond, unissuedBond],
        },
        loanTransactions: {
          items: [issuedLoan, unissuedLoan],
        },
      };
    });

    it('should return correct issued/unissued facilities', () => {
      const {
        issuedBonds,
        unissuedBonds,
        issuedLoans,
        unissuedLoans,
      } = issuedFacilities(dealSnapshot);

      expect(issuedBonds).toEqual([issuedBond]);
      expect(unissuedBonds).toEqual([unissuedBond]);
      expect(unissuedLoans).toEqual([unissuedLoan]);
      expect(issuedLoans).toEqual([issuedLoan]);
    });
  });

  describe('with facilitySnapshot', () => {
    let dealSnapshot;
    beforeAll(() => {
      dealSnapshot = {
        bondTransactions: {
          items: [{ facilitySnapshot: issuedBond }, { facilitySnapshot: unissuedBond }],
        },
        loanTransactions: {
          items: [{ facilitySnapshot: issuedLoan }, { facilitySnapshot: unissuedLoan }],
        },
      };
    });

    it('should return correct issued/unissued facilities', () => {
      const {
        issuedBonds,
        unissuedBonds,
        issuedLoans,
        unissuedLoans,
      } = issuedFacilities(dealSnapshot);

      expect(issuedBonds).toEqual([issuedBond]);
      expect(unissuedBonds).toEqual([unissuedBond]);
      expect(unissuedLoans).toEqual([unissuedLoan]);
      expect(issuedLoans).toEqual([issuedLoan]);
    });
  });

  describe('empty list when necessary', () => {
    let dealSnapshot;
    beforeAll(() => {
      dealSnapshot = {
        bondTransactions: {
          items: [issuedBond],
        },
        loanTransactions: {
          items: [unissuedLoan],
        },
      };
    });

    it('should return correct issued/unissued facilities', () => {
      const {
        issuedBonds,
        unissuedBonds,
        issuedLoans,
        unissuedLoans,
      } = issuedFacilities(dealSnapshot);

      expect(issuedBonds).toEqual([issuedBond]);
      expect(unissuedBonds).toEqual([]);
      expect(unissuedLoans).toEqual([unissuedLoan]);
      expect(issuedLoans).toEqual([]);
    });
  });
});
