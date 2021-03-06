const moment = require('moment');

const deal = {
  "_id": "1001349",
  "details": {
    "status": "Further Maker's input required",
    "bankSupplyContractID": "test",
    "bankSupplyContractName": "testing",
    "dateOfLastAction": moment().utc().valueOf(),
    "submissionType": "Manual Inclusion Application",
    "maker": {
      "username": "MAKER",
      "roles": [
        "maker"
      ],
      "bank": {
        "id": "956",
        "name": "Barclays Bank",
        "emails": [
          "maker4@ukexportfinance.gov.uk",
          "checker4@ukexportfinance.gov.uk"
        ]
      },
      "lastLogin": moment().utc().valueOf(),
      "firstname": "Hugo",
      "surname": "Drax",
      "email": "maker@ukexportfinance.gov.uk",
      "timezone": "Europe/London",
      "user-status": "active",
    },
    "owningBank": {
      "id": "956",
      "name": "Barclays Bank",
      "emails": [
        "maker4@ukexportfinance.gov.uk",
        "checker4@ukexportfinance.gov.uk"
      ]
    },
    "created": "1599048723110",
    "previousStatus": "Ready for Checker's approval",
    "checker": {
      "bank": {
        "id": "956",
        "name": "Barclays Bank"
      },
      "email": "checker@ukexportfinance.gov.uk",
      "firstname": "Emilio",
      "lastLogin": "1599048724584",
      "roles": [
        "checker"
      ],
      "surname": "Largo",
      "timezone": "Europe/London",
      "user-status": "active",
      "username": "CHECKER"
    },
    "submissionDate": moment().utc().valueOf(),
    "previousWorkflowStatus": "approved",
    "ukefDealId": "1001349",
    "approvalDate": "1599048727451"
  },
  "eligibility": {
    "status": "Completed",
    "criteria": [
      {
        "id": 11,
        "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.",
        "answer": true
      },
      {
        "id": 12,
        "description": "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.",
        "answer": false
      },
      {
        "id": 13,
        "description": "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).",
        "answer": true
      },
      {
        "id": 14,
        "description": "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.",
        "answer": true
      },
      {
        "id": 15,
        "description": "The Requested Cover Start Date is no more than three months from the date of submission.",
        "answer": true
      },
      {
        "id": 16,
        "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.",
        "answer": true
      },
      {
        "id": 17,
        "description": "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.",
        "answer": true
      },
      {
        "id": 18,
        "description": "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.",
        "answer": true
      }
    ]
  },
  "submissionDetails": {
    "status": "Incomplete",
    "indemnifier-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "indemnifier-address-line-1": "",
    "indemnifier-address-line-2": "",
    "indemnifier-address-line-3": "",
    "indemnifier-address-postcode": "",
    "indemnifier-address-town": "",
    "indemnifier-companies-house-registration-number": "",
    "indemnifier-correspondence-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "indemnifier-correspondence-address-line-1": "",
    "indemnifier-correspondence-address-line-2": "",
    "indemnifier-correspondence-address-line-3": "",
    "indemnifier-correspondence-address-postcode": "",
    "indemnifier-correspondence-address-town": "",
    "indemnifier-name": "",
    "industry-class": {
  "code": "56101",
  "name": "Licensed restaurants"
},
    "industry-sector": {
      "code": "1008",
      "name": "Accommodation and food service activities"
    },
    "legallyDistinct": "false",
    "sme-type": "Micro",
    "supplier-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "supplier-address-line-1": "test",
    "supplier-address-line-2": "test",
    "supplier-address-line-3": "test",
    "supplier-address-postcode": "test",
    "supplier-address-town": "test",
    "supplier-companies-house-registration-number": "",
    "supplier-correspondence-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "supplier-correspondence-address-is-different": "false",
    "supplier-correspondence-address-line-1": "",
    "supplier-correspondence-address-line-2": "",
    "supplier-correspondence-address-line-3": "",
    "supplier-correspondence-address-postcode": "",
    "supplier-correspondence-address-town": "",
    "supplier-name": "test",
    "supplier-type": "Exporter",
    "supply-contract-description": "test",
    "buyer-address-country": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "buyer-address-line-1": "test",
    "buyer-address-line-2": "test",
    "buyer-address-line-3": "test",
    "buyer-address-postcode": "test",
    "buyer-address-town": "test",
    "buyer-name": "test",
    "destinationOfGoodsAndServices": {
      "code": "GBR",
      "name": "United Kingdom"
    },
    "supplyContractConversionDate-day": "",
    "supplyContractConversionDate-month": "",
    "supplyContractConversionDate-year": "",
    "supplyContractConversionRateToGBP": "",
    "supplyContractCurrency": {
      "id": "GBP",
      "text": "GBP - UK Sterling"
    },
    "supplyContractValue": "1234.00"
  },
  "mockFacilities": [
    {
      "facilityType": "bond",
      "facilityStage": "Issued",
      "ukefGuaranteeInMonths": "12",
      "facilityValue": "1234.00",
      "currencySameAsSupplyContractCurrency": "true",
      "createdDate": 1599048722968.0,
      "bondIssuer": "",
      "bondType": "Bid bond",
      "bondBeneficiary": "",
      "guaranteeFeePayableByBank": "10.8000",
      "ukefExposure": "296.16",
      "lastEdited": 1599048722968.0,
      "riskMarginFee": "12",
      "coveredPercentage": "24",
      "minimumRiskMarginFee": "",
      "feeType": "At maturity",
      "dayCountBasis": "365",
      "currency": {
        "text": "GBP - UK Sterling",
        "id": "GBP"
      },
      "ukefFacilityID": [
        "12345"
      ],
      "issuedDate-day": moment().add().format('DD'),
      "issuedDate-month": moment().add().format('MM'),
      "issuedDate-year": moment().add().format('YYYY'),
      "requestedCoverStartDate-day": "",
      "requestedCoverStartDate-month": "",
      "requestedCoverStartDate-year": "",
      "coverEndDate-day": moment().add(1, 'month').format('DD'),
      "coverEndDate-month": moment().add(1, 'month').format('MM'),
      "coverEndDate-year": moment().add(1, 'month').format('YYYY'),
      "uniqueIdentificationNumber": "1234",
      "issueFacilityDetailsStarted": true,
      "uniqueIdentificationNumberRequiredForIssuance": true,
      "requestedCoverStartDate": moment().add(1, 'month').utc().valueOf(),
      "issuedDate": moment().add(1, 'week').utc().valueOf(),
      "issueFacilityDetailsProvided": true,
      "status": "Maker's input required",
      "previousFacilityStage": "Issued"
    },
    {
      "facilityType": "loan",
      "createdDate": 1599048722968.0,
      "facilityStage": "Unconditional",
      "ukefGuaranteeInMonths": "12",
      "bankReferenceNumber": "5678",
      "guaranteeFeePayableByBank": "18.0000",
      "lastEdited": 1599048722968.0,
      "facilityValue": "1234.00",
      "currencySameAsSupplyContractCurrency": "true",
      "interestMarginFee": "20",
      "coveredPercentage": "40",
      "minimumQuarterlyFee": "",
      "ukefExposure": "493.60",
      "premiumType": "At maturity",
      "dayCountBasis": "365",
      "ukefFacilityID": [
        "56789"
      ],
      "issuedDate-day": moment().add().format('DD'),
      "issuedDate-month": moment().add().format('MM'),
      "issuedDate-year": moment().add().format('YYYY'),
      "requestedCoverStartDate-day": "",
      "requestedCoverStartDate-month": "",
      "requestedCoverStartDate-year": "",
      "coverEndDate-day": moment().add(1, 'month').format('DD'),
      "coverEndDate-month": moment().add(1, 'month').format('MM'),
      "coverEndDate-year": moment().add(1, 'month').format('YYYY'),
      "disbursementAmount": "1,234.00",
      "issueFacilityDetailsStarted": true,
      "bankReferenceNumberRequiredForIssuance": true,
      "issuedDate": moment().add(1, 'week').utc().valueOf(),
      "issueFacilityDetailsProvided": true,
      "status": "Maker's input required",
      "previousFacilityStage": "Conditional",
      "requestedCoverStartDate": moment().add(1, 'month').utc().valueOf(),
    }
  ],
  "summary": {},
  "comments": [
    {
      "user": {
        "username": "MAKER",
        "roles": [
          "maker"
        ],
        "bank": {
          "id": "956",
          "name": "Barclays Bank",
          "emails": [
            "maker4@ukexportfinance.gov.uk",
            "checker4@ukexportfinance.gov.uk"
          ]
        },
        "lastLogin": "1599049060901",
        "firstname": "Hugo",
        "surname": "Drax",
        "email": "maker@ukexportfinance.gov.uk",
        "timezone": "Europe/London",
        "user-status": "active",
      },
      "timestamp": "1599049985118",
      "text": "zsdf"
    },
    {
      "user": {
        "username": "CHECKER",
        "roles": [
          "checker"
        ],
        "bank": {
          "id": "956",
          "name": "Barclays Bank"
        },
        "lastLogin": "1599048724584",
        "firstname": "Emilio",
        "surname": "Largo",
        "email": "checker@ukexportfinance.gov.uk",
        "timezone": "Europe/London",
        "user-status": "active",
      },
      "timestamp": "1599048760960",
      "text": "asdfsadf"
    },
    {
      "user": {
        "username": "MAKER",
        "roles": [
          "maker"
        ],
        "bank": {
          "id": "956",
          "name": "Barclays Bank",
          "emails": [
            "maker4@ukexportfinance.gov.uk",
            "checker4@ukexportfinance.gov.uk"
          ]
        },
        "lastLogin": "1599048728874",
        "firstname": "Hugo",
        "surname": "Drax",
        "email": "maker@ukexportfinance.gov.uk",
        "timezone": "Europe/London",
        "user-status": "active",
      },
      "timestamp": "1599048733918",
      "text": "Issued a facility"
    },
    {
      "user": {
        "username": "MAKER",
        "roles": [
          "maker"
        ],
        "bank": {
          "id": "956",
          "name": "Barclays Bank",
          "emails": [
            "maker4@ukexportfinance.gov.uk",
            "checker4@ukexportfinance.gov.uk"
          ]
        },
        "lastLogin": "1597782864959",
        "firstname": "Hugo",
        "surname": "Drax",
        "email": "maker@ukexportfinance.gov.uk",
        "timezone": "Europe/London",
        "user-status": "active"
      },
      "timestamp": "1597782964434",
      "text": "test"
    }
  ],
  "editedBy": [],
  "mandatoryCriteria": [
    {
      "id": "1",
      "title": "Supply contract/Transaction",
      "items": [
        {
          "id": 1,
          "copy": "The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate."
        },
        {
          "id": 2,
          "copy": "The Bank has complied with its policies and procedures in relation to the Transaction."
        },
        {
          "id": 3,
          "copy": "Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)"
        }
      ]
    },
    {
      "id": "2",
      "title": "Financial",
      "items": [
        {
          "id": 4,
          "copy": "The Bank Customer (to include both the Supplier and any Parent Obligor) is an <a href=\"/financial_difficulty_model_1.1.0.xlsx\" class=\"govuk-link\">Eligible Person spreadsheet</a>"
        }
      ]
    },
    {
      "id": "3",
      "title": "Credit",
      "items": [
        {
          "id": 5,
          "copy": "The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one- year probability of default of less than 14.1%."
        }
      ]
    },
    {
      "id": "4",
      "title": "Bank Facility Letter",
      "items": [
        {
          "id": 6,
          "copy": "The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland."
        }
      ]
    },
    {
      "id": "5",
      "title": "Legal",
      "items": [
        {
          "id": 7,
          "copy": "The Bank is the sole and beneficial owner of, and has legal title to, the Transaction."
        },
        {
          "id": 8,
          "copy": "The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction."
        },
        {
          "id": 9,
          "copy": "The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person."
        },
        {
          "id": 10,
          "copy": "The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction."
        }
      ]
    }
  ],
  "dealFiles": {
    "validationErrors": {
      "count": 0,
      "errorList": {
        "exporterQuestionnaire": {}
      }
    },
    "exporterQuestionnaire": [
      {
        "type": "general_correspondence",
        "fullPath": "private-files/ukef_portal_storage/1001560/questionnaire.pdf",
        "filename": "questionnaire.pdf",
        "mimetype": "application/pdf"
      }
    ],
    "security": ""
  },
  "ukefComments": [
    {
      "user": {
        "username": "DigitalService.TradeFinance@ukexportfinance.gov.uk",
        "firstname": "UKEF",
        "surname": "",
        "roles": [
          "interface"
        ],
        "bank": {
          "id": "*"
        }
      },
      "timestamp": "1599048727440",
      "text": "undefined"
    }
  ]
};

module.exports = deal;
