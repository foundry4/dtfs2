const typeDefs = `

type StatusType {
  code: Int
  msg: String
}

type Currency {
  currencyId: Int!
  text: String
  id: String
}

type OwningBank {
  name: String
}

type Maker {
  username: String
  firstname: String
  surname: String
}

type Checker {
  username: String
  firstname: String
  surname: String
}

type ErrorListItem {
  order: String
  text: String
}

type DealDetails {
  status: String
  bankSupplyContractID: String
  bankSupplyContractName: String
  ukefDealId: String
  submissionType: String
  maker: Maker
  checker: Checker
  checkerMIN: Checker
  dateOfLastAction: String
  submissionDate: String
  approvalDate: String
  created: String
  workflowStatus: String
  owningBank: OwningBank
}

type Deal {
  _id: String!
  details: DealDetails
}

type AllDeal {
  _id: String!
  status: String
  bankRef: String
  exporter: String
  product: String
  type: String
  lastUpdate: Float
}

type DealsQuery {
  status: StatusType
  count: Int
  deals: [Deal]
}

type AllDealsQuery {
  status: StatusType
  count: Int
  deals: [AllDeal]
}

input DashboardSort {
  field: String
  order: Int
}

input DashboardFilters {
  field: String
  value: String
  operator: String
}

input DealsInput {
  start: Int
  pagesize: Int
  filters: [DashboardFilters]
  sort: [DashboardSort]
}

type Transaction {
  deal_id: String
  deal_status: String
  deal_supplierName: String
  deal_bankSupplyContractID: String
  deal_ukefDealId: String
  deal_owningBank: String
  deal_created: String
  deal_submissionDate: String
  transaction_id: String
  bankFacilityId: String
  ukefFacilityId: String
  transactionType: String
  facilityValue: String
  transactionStage: String
  createdDate: String
  lastEdited: String
  issuedDate: String
  maker: String
  checker: String
  issueFacilityDetailsSubmitted: String
  currency: Currency
  requestedCoverStartDate: String
  previousCoverStartDate: String
  dateOfCoverChange: String
  issuedFacilitySubmittedToUkefTimestamp: String
  issuedFacilitySubmittedToUkefBy: String
}

type TransactionQuery {
  count: Int
  transactions: [Transaction]
}

input TransactionFilters {
  field: String
  value: String
  operator: String
}

input TransactionInput {
  start: Int
  pagesize: Int
  filters: [TransactionFilters]
}

type Exporter {
  _id : String
  companiesHouseRegistrationNumber: String
  companyName: String
  registeredAddress : String
  correspondenceAddress: String
  selectedIndustry: String
  industries: String,
  smeType: String
  probabilityOfDefault: Float
  isFinanceIncreasing: Boolean
  createdAt: Float
  updatedAt: Float
}

type CoverTerms {
  coverStart: Boolean
  noticeDate: Boolean
  facilityLimit: Boolean
  exporterDeclaration: Boolean
  dueDiligence: Boolean
  facilityLetter: Boolean
  facilityBaseCurrency: Boolean
  facilityPaymentCurrency: Boolean
  createdAt: Float
  updatedAt: Float
}

type GefDeal {
  _id: String
  userId: String
  status: String
  bankId: String
  exporterId: String
  coverTermsId: String
  bankInternalRefName: String
  mandatoryVersionId: String
  additionalRefName: String
  createdAt: Float
  updatedAt: Float
  exporter: Exporter
  coverTerms: CoverTerms
}

type GefDealsQuery {
  count: Int
  deals: [GefDeal]
}

type Query {
  currencies: [Currency]
  allDeals(params: DealsInput): AllDealsQuery
  deals(params: DealsInput): DealsQuery
  gefDeals(params: DealsInput): GefDealsQuery
  transactions(params: TransactionInput): TransactionQuery
}

type DealStatusErrorItem {
  comments: ErrorListItem
  confirmSubmit: ErrorListItem
}

type DealStatusUpdateResult {
  statusCode: Int
  status: String
  comments: String
  success: Boolean
  count: Int
  errorList: DealStatusErrorItem
}

type Mutation {
  dealStatusUpdate( dealId: String, status: String, comments: String): DealStatusUpdateResult
}
`;

module.exports = typeDefs;
