const dealReducer = (deal) => {
  const { details, submissionDetails, eligibility } = deal;

  const {
    status,
    submissionDate,
    submissionType,
    owningBank,
    bankSupplyContractID,
    bankSupplyContractName,
    maker,
  } = details;

  // TODO: maybe better to have flat structure, no submissionDetails / details
  // keep it simple/similar to regular source for now

  const result = {
    _id: deal._id, // eslint-disable-line no-underscore-dangle
    details: {
      status,
      submissionDate,
      submissionType,
      owningBank: {
        name: owningBank.name,
        emails: owningBank.emails,
      },
      maker: {
        firstname: maker.firstname,
        surname: maker.surname,
      },
      bankSupplyContractID,
      bankSupplyContractName,
    },

    submissionDetails: {
      supplierName: submissionDetails['supplier-name'],
      supplyContractCurrency: submissionDetails.supplyContractCurrency.id,
      supplyContractValue: submissionDetails.supplyContractValue,
      buyerName: submissionDetails['buyer-name'],
      buyerAddressCountry: submissionDetails['buyer-address-country'].name,
      buyerAddressLine1: submissionDetails['buyer-address-line-1'],
      buyerAddressLine2: submissionDetails['buyer-address-line-2'],
      buyerAddressLine3: submissionDetails['buyer-address-line-3'],
      buyerAddressPostcode: submissionDetails['buyer-address-postcode'],
      buyerAddressTown: submissionDetails['buyer-address-town'],
      supplyContractDescription:
        submissionDetails['supply-contract-description'],
      destinationCountry:
        submissionDetails.destinationOfGoodsAndServices
        && submissionDetails.destinationOfGoodsAndServices.name,
      indemnifierAddressCountry:
        submissionDetails['indemnifier-address-country'].name,
      indemnifierAddressLine1: submissionDetails['indemnifier-address-line-1'],
      indemnifierAddressLine2: submissionDetails['indemnifier-address-line-2'],
      indemnifierAddressLine3: submissionDetails['indemnifier-address-line-3'],
      indemnifierAddressPostcode:
        submissionDetails['indemnifier-address-postcode'],
      indemnifierAddressTown: submissionDetails['indemnifier-address-town'],
      indemnifierCorrespondenceAddressCountry:
        submissionDetails['indemnifier-correspondence-address-country'],
      indemnifierCorrespondenceAddressLine1:
        submissionDetails['indemnifier-correspondence-address-line-1'],
      indemnifierCorrespondenceAddressLine2:
        submissionDetails['indemnifier-correspondence-address-line-2'],
      indemnifierCorrespondenceAddressLine3:
        submissionDetails['indemnifier-correspondence-address-line-3'],
      indemnifierCorrespondenceAddressPostcode:
        submissionDetails['indemnifier-correspondence-address-postcode'],
      indemnifierCorrespondenceAddressTown:
        submissionDetails['indemnifier-correspondence-address-town'],
      indemnifierName: submissionDetails['indemnifier-name'],
      industryClass: submissionDetails['industry-class'],
      industrySector: submissionDetails['industry-sector.name'],
      supplierAddressCountry: submissionDetails['supplier-address-country'],
      supplierCountry: submissionDetails['supplier-address-country'],
      supplierAddressLine1: submissionDetails['supplier-address-line-1'],
      supplierAddressLine2: submissionDetails['supplier-address-line-2'],
      supplierAddressLine3: submissionDetails['supplier-address-line-3'],
      supplierAddressPostcode: submissionDetails['supplier-address-postcode'],
      supplierAddressTown: submissionDetails['supplier-address-town'],
      supplierCompaniesHouseRegistrationNumber:
        submissionDetails['supplier-companies-house-registration-number'],
      supplierCorrespondenceAddressCountry:
        submissionDetails['supplier-correspondence-address-country'],
      supplierCorrespondenceAddressLine1:
        submissionDetails['supplier-correspondence-address-line-1'],
      supplierCorrespondenceAddressLine2:
        submissionDetails['supplier-correspondence-address-line-2'],
      supplierCorrespondenceAddressLine3:
        submissionDetails['supplier-correspondence-address-line-3'],
      supplierCorrespondenceAddressPostcode:
        submissionDetails['supplier-correspondence-address-postcode'],
      supplierCorrespondenceAddressTown:
        submissionDetails['supplier-correspondence-address-town'],
      supplierAddress: submissionDetails.supplierAddress,
      smeType: submissionDetails['sme-type'],
    },
    eligibility: {
      agentAddressCountry: eligibility.agentAddressCountry,
      agentAddressLine1: eligibility.agentAddressLine1,
      agentAddressLine2: eligibility.agentAddressLine2,
      agentAddressLine3: eligibility.agentAddressLine3,
      agentAddressPostcode: eligibility.agentAddressPostcode,
      agentAddressTown: eligibility.agentAddressTown,
      agentName: eligibility.agentName,
    },
    eligibilityCriteria: deal.eligibility.criteria,
  };

  return result;
};

module.exports = dealReducer;
