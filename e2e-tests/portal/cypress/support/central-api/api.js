const api = () => {
  const url = `${Cypress.config('centralApiProtocol')}${Cypress.config('centralApiHost')}:${Cypress.config('centralApiPort')}`;
  return url;
};

module.exports.createFacility = async (facility, associatedDealId, user) => {
  console.log({
    url: `${api()}/v1/portal/facilities`,
    body: {
      facility: {
        ...facility,
        associatedDealId,
      },
      user,
    },
  });
  return cy.request({
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
    console.log({ resp });
    expect(resp.status).to.equal(200);
    return resp.body;
  }).catch((err) => {
    console.log({ err });
  });
};

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
  console.log({
    url: `${api()}/v1/portal/deals/${dealId}/status`,
  });
  cy.request({
    method: 'put',
    url: `${api()}/v1/portal/deals/${dealId}/status`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      status,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });
};

module.exports.updatePortalFacilityStatus = async (facilityId, status) => {
  cy.request({
    method: 'put',
    url: `${api()}/v1/portal/facilities/${facilityId}/status`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      status,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });
};
