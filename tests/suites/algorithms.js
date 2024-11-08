/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {createInitialVc, endpointCheck} from '../helpers.js';
import {expect} from 'chai';

export function algorithmSuite({
  suiteName
}) {
  it('When generating ECDSA signatures, the signature value MUST be ' +
    'expressed according to section 7 of [RFC4754] (sometimes referred to ' +
    'as the IEEE P1363 format) and encoded according to the specific ' +
    'cryptosuite proof generation algorithm.', async function() {
    this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#algorithms:~:text=When%20generating%20ECDSA%20signatures%2C%20the%20signature%20value%20MUST%20be%20expressed%20according%20to%20section%207%20of%20%5BRFC4754%5D%20(sometimes%20referred%20to%20as%20the%20IEEE%20P1363%20format)%20and%20encoded%20according%20to%20the%20specific%20cryptosuite%20proof%20generation%20algorithm';
  });
  it('For P-256 keys, the default hashing function, SHA-2 with 256 bits of ' +
    'output, MUST be used.', async function() {
    this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#algorithms:~:text=For%20P%2D256%20keys%2C%20the%20default%20hashing%20function%2C%20SHA%2D2%20with%20256%20bits%20of%20output%2C%20MUST%20be%20used.';
  });
  it('For P-384 keys, SHA-2 with 384-bits of output MUST be used, specified ' +
    'via the RDFC-1.0 implementation-specific parameter.', async function() {
    this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#algorithms:~:text=For%20P%2D384%20keys%2C%20SHA%2D2%20with%20384%2Dbits%20of%20output%20MUST%20be%20used%2C%20specified%20via%20the%20RDFC%2D1.0%20implementation%2Dspecific%20parameter.';
  });
}

export function ecdsaRdfc2019Algorithms({
  credential,
  endpoints,
  mandatoryPointers,
  keyType,
  suiteName,
  vcVersion
}) {
  return describe(`${suiteName} - Algorithms - VC ${vcVersion}`, function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...endpoints];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [name, {endpoints: issuers}] of endpoints) {
      const [issuer] = issuers;
      // does the endpoint support this test?
      if(!endpointCheck({endpoint: issuer, keyType, vcVersion})) {
        continue;
      }
      describe(`${name}: ${keyType}`, function() {
        let securedCredential = null;
        let proofs = [];
        before(async function() {
          securedCredential = await createInitialVc({
            issuer,
            vcVersion,
            vc: credential,
            mandatoryPointers
          });
          if(securedCredential) {
            proofs = Array.isArray(securedCredential.proof) ?
              securedCredential?.proof : [securedCredential?.proof];
            // only test proofs that match the relevant cryptosuite
            proofs = proofs.filter(p => p?.cryptosuite === suiteName);
          }
        });
        beforeEach(function() {
          this.currentTest.cell = {
            rowId: this.currentTest.title,
            columnId: this.currentTest.parent.title
          };
        });
        it('The transformation options MUST contain a type identifier for ' +
        'the cryptographic suite (type) and a cryptosuite identifier ' +
          '(cryptosuite).', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019';
        });
        it('Whenever this algorithm encodes strings, it MUST use UTF-8 ' +
        'encoding. (proof.type)', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019';
          for(const proof of proofs) {
            expect(proof?.type).to.exist;
            expect(proof.type).to.be.a('string');
            expect(
              proof.type.isWellFormed(),
              'Expected string to be a well formed UTF string'
            ).to.be.true;
          }
        });
        it('If options.type is not set to the string DataIntegrityProof ' +
        'and options.cryptosuite is not set to the string ecdsa-rdfc-2019, ' +
        'an error MUST be raised ', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019:~:text=If%20options.type%20is%20not%20set%20to%20the%20string%20DataIntegrityProof%20and%20options.cryptosuite%20is%20not%20set%20to%20the%20string%20ecdsa%2Drdfc%2D2019%2C%20an%20error%20MUST%20be%20raised';
        });
        it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MUST contain a cryptosuite ' +
        'identifier (cryptosuite).', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        });
        it('If proofConfig.type is not set to DataIntegrityProof and/or ' +
        'proofConfig.cryptosuite is not set to ecdsa-rdfc-2019, an error ' +
        'MUST be raised', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019:~:text=If%20proofConfig.type%20is%20not%20set%20to%20DataIntegrityProof%20and/or%20proofConfig.cryptosuite%20is%20not%20set%20to%20ecdsa%2Drdfc%2D2019%2C%20an%20error%20MUST%20be%20raised';
        });
        it('If proofConfig.created is set and if the value is not a valid ' +
        '[XMLSCHEMA11-2] datetime, an error MUST be raised', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
        });
        it('The proof options MUST contain a type identifier for the ' +
        'cryptographic suite (type) and MAY contain a cryptosuite ' +
        'identifier (cryptosuite).', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-serialization-ecdsa-rdfc-2019';
        });
      });
    }
  });
}
