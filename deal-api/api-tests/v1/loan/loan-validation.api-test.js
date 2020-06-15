const moment = require('moment');
const aDeal = require('../deals/deal-builder');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');

describe('/v1/deals/:id/loan', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });

  const allLoanFields = {
    facilityStage: 'Conditional',
    ukefGuaranteeInMonths: '12',
  };

  let aBarclaysMaker;
  let dealId;
  let loanId;

  const updateLoanInDeal = async (theDealId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${theDealId}/loan/${loanId}`);
    return response.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);

    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const loanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId: _id } = loanResponse.body;
    loanId = _id;
  });

  describe('GET /v1/deals/:id/loan/:id', () => {
    it('returns a loan with validationErrors for all required fields', async () => {
      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(body.validationErrors.count).toEqual(4);
      expect(body.validationErrors.errorList.facilityStage).toBeDefined();
      expect(body.validationErrors.errorList.currencySameAsSupplyContractCurrency).toBeDefined();
      // TODO add specs for below fields
      expect(body.validationErrors.errorList.interestMargin).toBeDefined();
      expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
    });
  });

  describe('PUT /v1/deals/:id/loan/:loanId', () => {
    it('returns 400 with validation errors', async () => {
      const { body, status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/${loanId}`);
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(4);
      expect(body.validationErrors.errorList.facilityStage).toBeDefined();
      expect(body.validationErrors.errorList.currencySameAsSupplyContractCurrency).toBeDefined();
      expect(body.validationErrors.errorList.interestMargin).toBeDefined();
      expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
    });

    describe('bankReferenceNumber', () => {
      describe('when has more than 30 characters', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            bankReferenceNumber: 'a'.repeat(31),
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.bankReferenceNumber.order).toBeDefined();
          expect(body.validationErrors.errorList.bankReferenceNumber.text).toEqual('Bank reference number must be 30 characters or fewer');
        });
      });
    });

    describe('facilityStage', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            facilityStage: '',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.facilityStage.order).toBeDefined();
          expect(body.validationErrors.errorList.facilityStage.text).toEqual('Select the Facility stage');
        });
      });
    });

    describe('when facilityStage is `Conditional`', () => {
      describe('ukefGuaranteeInMonths', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeInMonths: '',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Enter the Length of time that the UKEF\'s guarantee will be in place for');
          });
        });

        describe('when not numeric', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeInMonths: 'test',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a number, like 1 or 12');
          });
        });

        describe('when contains decimal', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeInMonths: '6.3',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a whole number, like 12');
          });
        });

        describe('when less than 0', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeInMonths: '-1',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be between 0 and 999');
          });
        });

        describe('when greater than 999', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeInMonths: '1000',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be between 0 and 999');
          });
        });
      });
    });

    describe('when facilityStage is `Unconditional`', () => {
      describe('bankReferenceNumber', () => {
        describe('when is missing', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Unconditional',
              bankReferenceNumber: '',
            };

            const body = await updateLoanInDeal(dealId, loan);

            expect(body.validationErrors.errorList.bankReferenceNumber.order).toBeDefined();
            expect(body.validationErrors.errorList.bankReferenceNumber.text).toEqual('Enter the Bank reference number');
          });
        });

        describe('when has more than 30 characters', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Unconditional',
              bankReferenceNumber: 'a'.repeat(31),
            };

            const body = await updateLoanInDeal(dealId, loan);

            expect(body.validationErrors.errorList.bankReferenceNumber.order).toBeDefined();
            expect(body.validationErrors.errorList.bankReferenceNumber.text).toEqual('Bank reference number must be 30 characters or fewer');
          });
        });
      });

      describe('requestedCoverStartDate', () => {
        const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
          const loan = {
            ...allLoanFields,
            facilityStage: 'Unconditional',
            ...requestedCoverStartDate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(nowDate).format('DD'),
              'requestedCoverStartDate-month': '',
              'requestedCoverStartDate-year': '',
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = dateValidationText(
              'Requested Cover Start Date',
              requestedCoverStartDateFields['requestedCoverStartDate-day'],
              requestedCoverStartDateFields['requestedCoverStartDate-month'],
              requestedCoverStartDateFields['requestedCoverStartDate-year'],
            );
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is before today', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(nowDate).subtract(1, 'day').format('DD'),
              'requestedCoverStartDate-month': moment(nowDate).format('MM'),
              'requestedCoverStartDate-year': moment(nowDate).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = 'Requested Cover Start Date must be today or in the future';
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is 3 months or more', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const requestedCoverStartDate = moment(nowDate).add(3, 'months').add(1, 'day');

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
              'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
              'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);

            expect(validationErrors.errorList.requestedCoverStartDate).toBeDefined();

            const expectedText = `Requested Cover Start Date must be between ${moment().format('Do MMMM YYYY')} and ${moment(nowDate).add(3, 'months').format('Do MMMM YYYY')}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });
      });

      describe('coverEndDate', () => {
        const updateCoverEndDate = async (coverEndDate) => {
          const loan = {
            ...allLoanFields,
            facilityStage: 'Unconditional',
            ...coverEndDate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when is missing', () => {
          it('should return validationError', async () => {
            const coverEndDateFields = {
              'coverEndDate-day': '',
              'coverEndDate-month': '',
              'coverEndDate-year': '',
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate.order).toBeDefined();

            expect(validationErrors.errorList.coverEndDate.text).toEqual('Enter the Cover End Date');
          });
        });

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const coverEndDateFields = {
              'coverEndDate-day': moment(nowDate).format('DD'),
              'coverEndDate-month': '',
              'coverEndDate-year': '',
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate.order).toBeDefined();

            const expectedText = dateValidationText(
              'Cover End Date',
              coverEndDateFields['coverEndDate-day'],
              coverEndDateFields['coverEndDate-month'],
              coverEndDateFields['coverEndDate-year'],
            );
            expect(validationErrors.errorList.coverEndDate.text).toEqual(expectedText);
          });
        });

        describe('when is before today', () => {
          it('should return validationError', async () => {
            const beforeToday = moment().subtract(1, 'day');

            const coverEndDateFields = {
              'coverEndDate-day': moment(beforeToday).format('DD'),
              'coverEndDate-month': moment(beforeToday).format('MM'),
              'coverEndDate-year': moment(beforeToday).format('YYYY'),
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate.order).toBeDefined();

            const expectedText = 'Cover End Date must be today or in the future';
            expect(validationErrors.errorList.coverEndDate.text).toEqual(expectedText);
          });
        });

        describe('when is before requestedCoverStartDate', () => {
          it('should return validationError', async () => {
            const date = moment();
            const requestedCoverStartDate = moment(date).add(2, 'months');
            const coverEndDate = moment(date).add(2, 'months').subtract(1, 'day');

            const loan = {
              ...allLoanFields,
              facilityStage: 'Unconditional',
              'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
              'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
              'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
              'coverEndDate-day': moment(coverEndDate).format('DD'),
              'coverEndDate-month': moment(coverEndDate).format('MM'),
              'coverEndDate-year': moment(coverEndDate).format('YYYY'),
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.coverEndDate.order).toBeDefined();
            expect(body.validationErrors.errorList.coverEndDate.text).toEqual('Cover End Date cannot be before Requested Cover Start Date');
          });
        });
      });
    });

    describe('currencySameAsSupplyContractCurrency', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            currencySameAsSupplyContractCurrency: '',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.currencySameAsSupplyContractCurrency).toBeDefined();
          expect(validationErrors.errorList.currencySameAsSupplyContractCurrency.text).toEqual('Select if the currency for this Transaction is the same as your Supply Contract currency');
        });
      });
    });

    describe('when currencySameAsSupplyContractCurrency is false', () => {
      describe('conversionRate', () => {
        const updateBondConversionRate = async (conversionRate) => {
          const loan = {
            ...allLoanFields,
            currencySameAsSupplyContractCurrency: 'false',
            conversionRate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when missing', () => {  
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Enter the Conversion rate');
          });
        });

        describe('when not a number', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('test');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate must be a number, like 100 or 100.4');
          });
        });

        describe('with more than 12 characters', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('1234567.123456');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate must be 12 numbers or fewer. You can include up to 6 decimal places as part of your number.');
          });
        });

        describe('with more than 6 characters as a whole number', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('1234567');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate can only include up to 6 decimal places');
          });
        });

        describe('with more than 6 decimal places', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('1.1234567');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate can only include up to 6 decimal places');
          });
        });
      });

      describe('conversionRateDate', () => {
        const updateBondConversionRateDate = async (conversionRateDate) => {
          const loan = {
            ...allLoanFields,
            currencySameAsSupplyContractCurrency: 'false',
            ...conversionRateDate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when missing', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRateDate({});
            expect(validationErrors.errorList.conversionRateDate).toBeDefined();
            expect(validationErrors.errorList.conversionRateDate.text).toEqual('Enter the Conversion rate date');
          });
        });

        describe('when in the future', () => {
          it('should return validationError', async () => {
            const date = moment().add(1, 'day');
            const conversionRateFields = {
              'conversionRateDate-day': moment(date).format('DD'),
              'conversionRateDate-month': moment(date).format('MM'),
              'conversionRateDate-year': moment(date).format('YYYY'),
            };

            const { validationErrors } = await updateBondConversionRateDate(conversionRateFields);
            expect(validationErrors.errorList.conversionRateDate).toBeDefined();
            expect(validationErrors.errorList.conversionRateDate.text).toEqual('Conversion rate date must be today or in the past');
          });
        });

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const date = moment().add(1, 'day');
            const conversionRateFields = {
              'conversionRateDate-day': moment(date).format('DD'),
              'conversionRateDate-month': '',
              'conversionRateDate-year': '',
            };

            const { validationErrors } = await updateBondConversionRateDate(conversionRateFields);
            expect(validationErrors.errorList.conversionRateDate).toBeDefined();

            const expectedText = dateValidationText(
              'Conversion rate date',
              conversionRateFields['conversionRateDate-day'],
              conversionRateFields['conversionRateDate-month'],
              conversionRateFields['conversionRateDate-year'],
            );

            expect(validationErrors.errorList.conversionRateDate.text).toEqual(expectedText);
          });
        });
      });

      describe('currency', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              currencySameAsSupplyContractCurrency: 'false',
              currency: '',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.currency).toBeDefined();
            expect(validationErrors.errorList.currency.text).toEqual('Enter the Currency');
          });
        });
      });
    });

    describe('coveredPercentage', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            coveredPercentage: '',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Enter the Covered Percentage');
        });
      });

      describe('when not between 1 and 99', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            coveredPercentage: '123test',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be a number, like 1 or 80');
        });
      });

      describe('when less than 1', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            coveredPercentage: '0.09',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
        });
      });

      describe('when greater than 80', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            coveredPercentage: '81',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
        });
      });

      describe('when has more 4 decimals', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            coveredPercentage: '12.34567',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must have less than 5 decimals, like 12 or 12.3456');
        });
      });
    });
  });
});
