const api = () => {
  const url = `${Cypress.config('centralApiProtocol')}${Cypress.config('centralApiHost')}:${Cypress.config('centralApiPort')}`;
  return url;
};

module.exports.createFacility = async (facility, associatedDealId, user) =>
  cy.request({
    method: 'POST',
    url: `${api()}/v1/portal/facilities`,
    body: {
      facility: {
        ...facility,
        associatedDealId,
      },
      user,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });

module.exports.updateFacility = async (facilityId, facilityUpdate, user) =>
  cy.request({
    method: 'PUT',
    url: `${api()}/v1/portal/facilities/${facilityId}`,
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    body: {
      ...facilityUpdate,
      user,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });

module.exports.deleteFacility = async (facilityId, user) =>
  cy.request({
    method: 'DELETE',
    url: `${api()}/v1/portal/facilities/${facilityId}`,
    body: {
      user,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });

module.exports.updatePortalDealStatus = async (dealId, status) => {
  cy.request({
    method: 'put',
    url: `${api()}/v1/portal/deals/${dealId}/status`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      status,
    },
  }).then((resp) => {
    console.log({ resp });
    expect(resp.status).to.equal(200);
    return resp.body;
  });
};
