/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
// import {bs58Decode, bs58Encode} from './helpers.js';
// import {verificationFail, verificationSuccess} from './assertions.js';
import {
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';
import {endpoints} from 'vc-api-test-suite-implementations';

const tag = 'ecdsa-2019';
// only use implementations with `ecdsa-2019` verifiers.
const {match, nonMatch} = endpoints.filterByTag({
  tags: [tag],
  property: 'verifiers'
});

describe('ecdsa-2019 (verify)', function() {
//   let credential;
  before(async function() {
    // const {match} = endpoints.filterByTag({
    //   tags: [tag],
    //   property: 'issuers'
    // });
  });
  checkDataIntegrityProofVerifyErrors({
    implemented: match,
    notImplemented: nonMatch
  });
  //   describe('ecdsa-2019 cryptosuite (verifier)', function() {
  //     // this will tell the report
  //     // to make an interop matrix with this suite
  //     this.matrix = true;
  //     this.report = true;
  //     this.rowLabel = 'Test Name';
  //     this.columnLabel = 'Verifier';
  //     this.implemented = [...match.keys()];
  //     this.notImplemented = [...nonMatch.keys()];

//     for(const [columnId, {endpoints}] of match) {
//       describe(columnId, function() {
//         // wrap the testApi config in an Implementation class
//         const [verifier] = endpoints;
//         it('MUST verify a valid VC with an ecdsa-2019 proof',
//           async function() {
//             this.test.cell = {columnId, rowId: this.test.title};
//             const credential = credentials.clone('issuedVc');
//             await verificationSuccess({credential, verifier});
//           });
//         it('If the "proofValue" field, when decoded to raw bytes, is not ' +
//       '64 bytes in length if the associated public key is 32 bytes ' +
//      'in length, or 114 bytes in length if the public key is 57 bytes ' +
//       'in length, an INVALID_PROOF_LENGTH error MUST be returned.',
//         async function() {
//           this.test.cell = {columnId, rowId: this.test.title};
//           const credential = credentials.clone('issuedVc');
//           const proofBytes = bs58Decode({id: credential.proof.proofValue});
//           const randomBytes = new Uint8Array(32).map(
//             () => Math.floor(Math.random() * 255));
//           credential.proof.proofValue = bs58Encode(
//             new Uint8Array([...proofBytes, ...randomBytes]));
//           await verificationFail({credential, verifier});
//         });
//         it('If the "cryptosuite" field is not the string "ecdsa-2019", ' +
//       'an UNKNOWN_CRYPTOSUITE_TYPE error MUST be returned.',
//         async function() {
//           this.test.cell = {columnId, rowId: this.test.title};
//           const credential = credentials.clone('incorrectCryptosuite');
//           await verificationFail({credential, verifier});
//         });
//       });
//     }
//   });
});
