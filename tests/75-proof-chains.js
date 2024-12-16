/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  addProof,
  createVc,
} from './vc-issuer/index.js';
import {
  setupReportableTestSuite,
  setupRow,
} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';

const cryptosuites = [
  'ecdsa-rdfc-2019',
];

const {match: issuers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'issuers'
});

const {match: verifiers} = endpoints.filterByTag({
  tags: cryptosuites,
  property: 'verifiers'
});

describe('Proof Chains', function() {
  setupReportableTestSuite(this);
  for(const [columnId, {endpoints}] of verifiers) {
    describe(columnId, function() {
      const [verifier] = endpoints;
      let issuedCredential;
      let issuedProofSet;
      let issuedProofChain;
      before(async function() {
        // signedCredential = await addProof(
        //   generateCredential());
        issuedCredential = await createVc();
        issuedProofSet = await addProof(
          structuredClone(issuedCredential));
        issuedProofChain = await addProof(
          structuredClone(issuedProofSet), issuedCredential.proof[0].id);
      });
      beforeEach(setupRow);
      it('If a proof with id value equal to the value of previousProof ' +
        'does not exist in allProofs, an error MUST be raised and SHOULD ' +
        'convey an error type of PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#verify-proof-sets-and-chains';
      });
      it('If any element of previousProof list has an id attribute ' +
        'value that does not match the id attribute value of any ' +
        'element of allProofs, an error MUST be raised and SHOULD ' +
        'convey an error type of PROOF_VERIFICATION_ERROR.',
      async function() {
        this.test.link = 'https://www.w3.org/TR/vc-data-integrity/#verify-proof-sets-and-chains';
      });
    });
  }
});
