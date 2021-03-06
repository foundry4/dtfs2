import gql from 'graphql-tag';

const allDealsQuery = gql`
query allDeals($start: Int, $pagesize: Int, $filters: [DashboardFilters]){
  allDeals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals {
      _id
      status
      bankRef
      exporter
      product
      type
      lastUpdate
    }
  }
}`;

export default allDealsQuery;
