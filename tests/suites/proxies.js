/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {Token, Type} from 'cborg';
import crypto from 'node:crypto';
import {DeriveStub} from './stubs.js';
/**
 * Creates a proxy of an object with stubs.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * @param {object} options - Options to use.
 * @param {object} options.original - The original object.
 * @param {object} options.stubs - Stubs to replace the original objects
 *   properties and methods.
 *
 * @returns {Proxy<object>} Returns a Proxy.
 */
export function createProxy({original, stubs}) {
  if(typeof original !== 'object') {
    throw new Error(`Expected parameter original to be an object received ` +
    `${typeof original}`);
  }
  return new Proxy(original, {
    get(target, prop) {
      if(stubs[prop]) {
        return stubs[prop];
      }
      return Reflect.get(...arguments);
    }
  });
}

/**
 * The major jsonld api suites use is canonize.
 * This function intercepts calls on canonize and
 * pass safe: false allowing for invalid jsonld to
 * be issued.
 *
 * @param {object} suite - A DataIntegrityProof.
 *
 * @returns {Proxy<object>} Returns a proxy of the proof.
 */
export function unsafeProxy(suite) {
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

//ecdsa-rdfc-2019 proxy
export function invalidHashProxy({
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

// ecdsa-rdfc-2019 concat 2 unit8Arrays together
function _concat(b1, b2) {
  const rval = new Uint8Array(b1.length + b2.length);
  rval.set(b1, 0);
  rval.set(b2, b1.length);
  return rval;
}

// ecdsa-rdfc-2019 sha hashing function
export async function sha({algorithm, string}) {
  return new Uint8Array(crypto.createHash(algorithm).update(string).digest());
}

// ecdsa-rdfc-2019 _canonizeProof method
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

export function invalidCborTagProxy(suite) {
  const typeEncoders = {
    Uint8Array(uint8Array) {
      return [
        new Token(Type.tag, 2),
        new Token(Type.bytes, uint8Array.map(b => b + 1))
      ];
    }
  };
  const stubs = {derive({...args}) {
    return new DeriveStub({typeEncoders}).derive({...args});
  }};
  if(suite._cryptosuite) {
    suite._cryptosuite = createProxy({
      original: suite._cryptosuite,
      stubs
    });
  }
  return suite;
}
