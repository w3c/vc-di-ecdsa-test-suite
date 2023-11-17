/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import {createInitialVc} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';
import {validVc as vc} from './validVc.js';

const should = chai.should();
const tag = 'ecdsa-rdfc-2019';

// only use implementations with `ecdsa-rdfc-2019` issuers.
const {
  match: issuerMatches
} = endpoints.filterByTag({tags: [tag], property: 'issuers'});
const {
  match: verifierMatches
} = endpoints.filterByTag({tags: [tag], property: 'verifiers'});

describe('ecdsa-rdfc-2019 (interop)', function() {
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [...verifierMatches.keys()];
  this.rowLabel = 'Issuer';
  this.columnLabel = 'Verifier';
  for(const [issuerName, {endpoints}] of issuerMatches) {
    let issuedVc;
    before(async function() {
      const [issuer] = endpoints;
      issuedVc = await createInitialVc({issuer, vc});
    });
    for(const [verifierName, {endpoints}] of verifierMatches) {
      const [verifier] = endpoints;
      it(`${verifierName} should verify ${issuerName}`, async function() {
        this.test.cell = {rowId: issuerName, columnId: verifierName};
        const body = {
          verifiableCredential: issuedVc,
          options: {
            checks: ['proof']
          }
        };
        const {result, error} = await verifier.post({json: body});
        should.not.exist(error, 'Expected verifier to not error.');
        should.exist(result, 'Expected result from verifier.');
        should.exist(result.status, 'Expected verifier to return an HTTP' +
          'status code');
        result.status.should.equal(200, 'Expected HTTP status code to be 200.');
      });
    }
  }
});
