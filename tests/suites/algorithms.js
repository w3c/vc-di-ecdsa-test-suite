/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */

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
  endpoints,
  suiteName,
  keyType,
  vcVersion
}) {
  return describe(`${suiteName} - Algorithms - VC ${vcVersion}`, function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [...endpoints];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    for(const [name, {endpoints: issuers}] of endpoints) {
      describe(`${name}: ${keyType}`, function() {
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
      });
    }
  });
}
