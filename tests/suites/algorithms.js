/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  assertions,
  generators,
  issueCloned
} from 'data-integrity-test-suite-assertion';
import crypto from 'node:crypto';
import {getMultiKey} from '../vc-generator/key-gen.js';
import {getSuites} from './helpers.js';

export function commonAlgorithms({
  credential,
  verifiers,
  mandatoryPointers,
  selectivePointers,
  keyTypes,
  suiteName,
  vcVersion,
  setup = _commonSetup
}) {
  const title = `${suiteName} - Algorithms Common - VC ${vcVersion}`;
  return describe(title, function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    const credentials = new Map(keyTypes.map(keyType => [keyType, null]));
    before(async function() {
      for(const keyType of keyTypes) {
        credentials.set(keyType, await setup({
          credential,
          verifiers,
          mandatoryPointers,
          selectivePointers,
          keyType,
          suiteName,
          vcVersion
        }));
      }
    });
    for(const [name, {endpoints}] of verifiers) {
      const [verifier] = endpoints;
      this.implemented.push(`${name}`);
      describe(`${name}`, function() {
        beforeEach(function() {
          this.currentTest.cell = {
            rowId: this.currentTest.title,
            columnId: this.currentTest.parent.title
          };
        });
        it('When generating ECDSA signatures, the signature value MUST be ' +
          'expressed according to section 7 of [RFC4754] (sometimes referred ' +
          'to as the IEEE P1363 format) and encoded according to the ' +
          'specific cryptosuite proof generation algorithm.', async function() {
          this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#algorithms:~:text=When%20generating%20ECDSA%20signatures%2C%20the%20signature%20value%20MUST%20be%20expressed%20according%20to%20section%207%20of%20%5BRFC4754%5D%20(sometimes%20referred%20to%20as%20the%20IEEE%20P1363%20format)%20and%20encoded%20according%20to%20the%20specific%20cryptosuite%20proof%20generation%20algorithm';
          for(const [keyType, fixtures] of credentials) {
            await assertions.verificationFail({
              credential: fixtures.get('invalidHash'),
              verifier,
              reason: `Should not verify VC signed w/ ${keyType} & invalidHash.`
            });
          }
        });
        if(keyTypes.includes('P-256')) {
          it('For P-256 keys, the default hashing function, SHA-2 with 256 ' +
            'bits of output, MUST be used.', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#algorithms:~:text=For%20P%2D256%20keys%2C%20the%20default%20hashing%20function%2C%20SHA%2D2%20with%20256%20bits%20of%20output%2C%20MUST%20be%20used.';
            await assertions.verificationFail({
              credential: credentials.get('P-256').get('invalidHash'),
              verifier,
              reason: `Should not verify VC with invalid hash.`
            });
          });
        }
        if(keyTypes.includes('P-384')) {
          it('For P-384 keys, SHA-2 with 384-bits of output MUST be used, ' +
            'specified via the RDFC-1.0 implementation-specific parameter.',
          async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#algorithms:~:text=For%20P%2D384%20keys%2C%20SHA%2D2%20with%20384%2Dbits%20of%20output%20MUST%20be%20used%2C%20specified%20via%20the%20RDFC%2D1.0%20implementation%2Dspecific%20parameter.';
            await assertions.verificationFail({
              credential: credentials.get('P-384').get('invalidHash'),
              verifier,
              reason: `Should not verify VC with invalid hash.`
            });
          });
        }
      });
    }
  });
}

export function ecdsaRdfc2019Algorithms({
  credential,
  verifiers,
  mandatoryPointers,
  selectivePointers,
  keyTypes,
  suiteName,
  vcVersion,
  setup = _setup
}) {
  return describe(`${suiteName} - Algorithms - VC ${vcVersion}`, function() {
    this.matrix = true;
    this.report = true;
    this.implemented = [];
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Implementation';
    const credentials = new Map(keyTypes.map(kt => [kt, null]));
    before(async function() {
      for(const keyType of keyTypes) {
        credentials.set(keyType, await setup({
          suiteName,
          keyType,
          credential,
          mandatoryPointers,
          selectivePointers
        }));
      }
    });
    for(const [name, {endpoints}] of verifiers) {
      const [verifier] = endpoints;
      for(const keyType of keyTypes) {
        this.implemented.push(`${name}: ${keyType}`);
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
            await assertions.verificationFail({
              verifier,
              credentials: credentials.get('noTypeOrCryptosuite'),
              reason: 'Should not verify VC w/ no type or cryptosuite ' +
              'identifier'
            });
          });
          it('Whenever this algorithm encodes strings, it MUST use UTF-8 ' +
          'encoding. (proof.type)', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019';
            await assertions.verificationFail({
              verifier,
              credentials: credentials.get('notUTF8'),
              reason: 'Should not verify VC w/ non UTF-8 encoding'
            });
          });
          it('If options.type is not set to the string DataIntegrityProof ' +
          'and options.cryptosuite is not set to the string ecdsa-rdfc-2019, ' +
          'an error MUST be raised ', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#transformation-ecdsa-rdfc-2019:~:text=If%20options.type%20is%20not%20set%20to%20the%20string%20DataIntegrityProof%20and%20options.cryptosuite%20is%20not%20set%20to%20the%20string%20ecdsa%2Drdfc%2D2019%2C%20an%20error%20MUST%20be%20raised';
            await assertions.verificationFail({
              verifier,
              credentials: credentials.get('noTypeOrCryptosuite'),
              reason: 'Should not verify VC w/ no type or cryptosuite ' +
              'identifier'
            });
          });
          it('The proof options MUST contain a type identifier for the ' +
          'cryptographic suite (type) and MUST contain a cryptosuite ' +
          'identifier (cryptosuite).', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
            await assertions.verificationFail({
              verifier,
              credentials: credentials.get('noTypeOrCryptosuite'),
              reason: 'Should not verify VC w/ no type or cryptosuite ' +
              'identifier'
            });
          });
          it('If proofConfig.type is not set to DataIntegrityProof and/or ' +
          'proofConfig.cryptosuite is not set to ecdsa-rdfc-2019, an error ' +
          'MUST be raised', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019:~:text=If%20proofConfig.type%20is%20not%20set%20to%20DataIntegrityProof%20and/or%20proofConfig.cryptosuite%20is%20not%20set%20to%20ecdsa%2Drdfc%2D2019%2C%20an%20error%20MUST%20be%20raised';
            await assertions.verificationFail({
              verifier,
              credentials: credentials.get('noTypeOrCryptosuite'),
              reason: 'Should not verify VC w/ no type or cryptosuite ' +
              'identifier'
            });
          });
          it('If proofConfig.created is set and if the value is not a valid ' +
          '[XMLSCHEMA11-2] datetime, an error MUST be raised',
          async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-configuration-ecdsa-rdfc-2019';
            await assertions.verificationFail({
              verifier,
              credentials: credentials.get('invalidCreated'),
              reason: 'Should not verify VC w/ invalid "proof.created"'
            });
          });
          it('The proof options MUST contain a type identifier for the ' +
          'cryptographic suite (type) and MAY contain a cryptosuite ' +
          'identifier (cryptosuite).', async function() {
            this.test.link = 'https://w3c.github.io/vc-di-ecdsa/#proof-serialization-ecdsa-rdfc-2019';
            await assertions.verificationFail({
              verifier,
              credentials: credentials.get('noTypeOrCryptosuite'),
              reason: 'Should not verify VC w/ no type or cryptosuite ' +
              'identifier'
            });
          });
        });

      }
    }
  });
}

async function _setup({
  credential,
  mandatoryPointers,
  selectivePointers,
  suiteName,
  keyType
}) {
  const credentials = new Map();
  const keyPair = await getMultiKey({keyType});
  const signer = keyPair.signer();
  const _credential = structuredClone(credential);
  _credential.issuer = keyPair.controller;
  const {invalidCreated} = generators?.dates;
  credentials.set('invalidCreated', await issueCloned(invalidCreated({
    credential: structuredClone(_credential),
    ...getSuites({
      signer,
      suiteName,
      selectivePointers,
      mandatoryPointers
    })
  })));
  // stub suite canonize via Proxy cryptosuite.canonize and set safe to false
  credentials.set('noTypeOrCryptosuite',
    await issueCloned(_generateNoTypeCryptosuite({
      signer,
      suiteName,
      credential: _credential,
      mandatoryPointers,
      selectivePointers
    })));
  return credentials;
}

function _generateNoTypeCryptosuite({
  signer,
  suiteName,
  credential,
  mandatoryPointers,
  selectivePointers
}) {
  const {suite, selectiveSuite} = getSuites({
    signer,
    suiteName,
    selectivePointers,
    mandatoryPointers
  });
  const {
    invalidProofType,
    invalidCryptosuite
  } = generators?.mandatory;
  const noType = invalidProofType({
    credential: structuredClone(credential),
    suite: unsafeProxy(suite),
    selectiveSuite: unsafeProxy(selectiveSuite),
    proofType: ''
  });
  return invalidCryptosuite({...noType, cryptosuiteName: ''});
}

function unsafeProxy(suite) {
  if(typeof suite !== 'object') {
    return suite;
  }
  // if the suite has a cryptosuite object proxy it
  if(suite._cryptosuite) {
    suite._cryptosuite = new Proxy(suite._cryptosuite, {
      get(target, prop) {
        if(prop === 'canonize') {
          return function(doc, options) {
            return target.canonize(doc, {...options, safe: false});
          };
        }
        return Reflect.get(...arguments);
      }
    });
  }
  return new Proxy(suite, {
    get(target, prop) {
      if(prop === 'canonize') {
        return function(doc, options) {
          return target.canonize(doc, {...options, safe: false});
        };
      }
      return Reflect.get(...arguments);
    }
  });
}

async function _commonSetup({
  credential,
  mandatoryPointers,
  selectivePointers,
  suiteName,
  keyType
}) {
  const credentials = new Map();
  const keyPair = await getMultiKey({keyType});
  const signer = keyPair.signer();
  const _credential = structuredClone(credential);
  _credential.issuer = keyPair.controller;
  const {suite, selectiveSuite} = getSuites({
    signer,
    suiteName,
    selectivePointers,
    mandatoryPointers
  });
  credentials.set('invalidHash', await issueCloned({
    credential: _credential,
    suite: invalidHashProxy({suite, suiteName, keyType}),
    selectiveSuite: invalidHashProxy({
      suite: selectiveSuite,
      suiteName,
      keyType
    })
  }));
  return credentials;
}

function invalidHashProxy({
  suiteName,
  keyType,
  suite,
}) {
  if(typeof suite !== 'object') {
    return suite;
  }
  if(suite._cryptosuite) {
    if(suiteName !== 'ecdsa-rdfc-2019') {
      throw new Error(`Unsupported suite ${suiteName}`);
    }
    suite._cryptosuite = new Proxy(suite._cryptosuite, {
      get(target, prop) {
        if(prop === 'createVerifyData') {
          return async function({
            cryptosuite, document, proof,
            documentLoader, dataIntegrityProof
          } = {}) {
            // this switch the hash to the wrong hash for that keyType
            const algorithm = (keyType === 'P-256') ? 'sha384' : 'sha256';
            const c14nOptions = {
              documentLoader,
              safe: true,
              base: null,
              skipExpansion: false,
              messageDigestAlgorithm: algorithm
            };

            // await both c14n proof hash and c14n document hash
            const [proofHash, docHash] = await Promise.all([
              // canonize and hash proof
              _canonizeProof(proof, {
                document, cryptosuite, dataIntegrityProof, c14nOptions
              }).then(c14nProofOptions => sha({
                algorithm,
                string: c14nProofOptions
              })),
              // canonize and hash document
              cryptosuite.canonize(document, c14nOptions).then(
                c14nDocument => sha({algorithm, string: c14nDocument}))
            ]);
            // concatenate hash of c14n proof options and hash of c14n document
            return _concat(proofHash, docHash);
          };
        }
        return Reflect.get(...arguments);
      }
    });
  }
  return suite;
}

function _concat(b1, b2) {
  const rval = new Uint8Array(b1.length + b2.length);
  rval.set(b1, 0);
  rval.set(b2, b1.length);
  return rval;
}

export async function sha({algorithm, string}) {
  return new Uint8Array(crypto.createHash(algorithm).update(string).digest());
}

async function _canonizeProof(proof, {
  document, cryptosuite, dataIntegrityProof, c14nOptions
}) {
  // `proofValue` must not be included in the proof options
  proof = {
    '@context': document['@context'],
    ...proof
  };
  dataIntegrityProof.ensureSuiteContext({
    document: proof, addSuiteContext: true
  });
  delete proof.proofValue;
  return cryptosuite.canonize(proof, c14nOptions);
}
