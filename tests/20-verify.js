/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {verificationFail, verificationSuccess} from './assertions.js';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {createInitialVc} from './helpers.js';
import {endpoints} from 'vc-api-test-suite-implementations';
import {klona} from 'klona';
import {validVc as vc} from './validVc.js';

const tag = 'ecdsa-2019';
// only use implementations with `ecdsa-2019` verifiers.
const {match} = endpoints.filterByTag({
  tags: [tag],
  property: 'verifiers'
});

describe('ecdsa-2019 (verify)', function() {
  let credential;
  beforeEach(async function() {
    const {match} = endpoints.filterByTag({
      tags: [tag],
      property: 'issuers'
    });
    // Use DB issuer to issue a verifiable credential for the verifier tests
    const [issuer] = match.get('Digital Bazaar').endpoints;
    const issuedVc = await createInitialVc({issuer, vc});
    credential = klona(issuedVc);
  });
  checkDataIntegrityProofVerifyErrors({
    implemented: match
  });
  describe('ecdsa-2019 cryptosuite (verifier)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [...match.keys()];

    for(const [columnId, {endpoints}] of match) {
      describe(columnId, function() {
        // wrap the testApi config in an Implementation class
        const [verifier] = endpoints;
        it('MUST verify a valid VC with an ecdsa-2019 proof',
          async function() {
            this.test.cell = {columnId, rowId: this.test.title};
            await verificationSuccess({credential, verifier});
          });
        it('If the "cryptosuite" field is not the string "ecdsa-2019", ' +
          'an "INVALID_PROOF_CONFIGURATION" error MUST be returned.',
        async function() {
          this.test.cell = {columnId, rowId: this.test.title};
          credential.cryptosuite = 'not-ecdsa-2019';
          await verificationFail({credential, verifier});
        });
      });
    }
  });
});
