/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import chai from 'chai';
import {
  checkDataIntegrityProofFormat
} from 'data-integrity-test-suite-assertion';
import {createInitialVc} from './helpers.js';
import {endpoints} from 'vc-api-test-suite-implementations';
import {shouldBeBs58} from './assertions.js';
import {validVc as vc} from './validVc.js';

const tag = 'ecdsa-2019';
const cryptosuite = 'ecdsa-2019';
const {match, nonMatch} = endpoints.filterByTag({
  tags: [tag],
  property: 'issuers'
});
const should = chai.should();

describe('ecdsa-2019 (P-256 create)', function() {
  checkDataIntegrityProofFormat({
    implemented: match,
    notImplemented: nonMatch
  });
  describe('ecdsa-2019 (P-256 issuer)', function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [columnId, {endpoints, implementation}] of match) {
      const [issuer] = endpoints;
      const verifier = implementation.verifiers.find(
        v => v.tags.has(tag));
      let issuedVc;
      let proofs;
      before(async function() {
        issuedVc = await createInitialVc({issuer, vc});
        proofs = Array.isArray(issuedVc?.proof) ?
          issuedVc.proof : [issuedVc?.proof];
      });
      it('MUST have property "cryptosuite"', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        proofs.some(
          proof => typeof proof?.cryptosuite === 'string'
        ).should.equal(
          true,
          'Expected at least one proof to have cryptosuite.'
        );
      });
      it('The field "cryptosuite" MUST be `ecdsa-2019`', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        proofs.some(
          proof => proof?.cryptosuite === cryptosuite
        ).should.equal(
          true,
          'Expected at least one proof to have "cryptosuite" `ecdsa-2019`.'
        );
      });
      it('"proofValue" field MUST be a multibase-encoded base58-btc encoded ' +
        'value', function() {
        this.test.cell = {columnId, rowId: this.test.title};
        const multibase = 'z';
        proofs.some(proof => {
          const value = proof?.proofValue;
          return value.startsWith(multibase) && shouldBeBs58(value);
        }).should.equal(
          true,
          'Expected "proof.proofValue" to be multibase-encoded base58-btc ' +
          'value.'
        );
      });
      it('"proof" MUST verify when using a conformant verifier.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          should.exist(verifier, 'Expected implementation to have a VC ' +
            'HTTP API compatible verifier.');
          const {result, error} = await verifier.post({json: {
            verifiableCredential: issuedVc,
            options: {checks: ['proof']}
          }});
          should.not.exist(error, 'Expected verifier to not error.');
          should.exist(result, 'Expected verifier to return a result.');
          result.status.should.not.equal(400, 'Expected status code to not ' +
            'be 400.');
          result.status.should.equal(200, 'Expected status code to be 200.');
        });
    }
  });
});
