/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as base64url from 'base64url-universal';
import * as cborg from 'cborg';
import crypto from 'node:crypto';

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
  if(typeof original === 'object') {
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

// concat 2 unit8Arrays together
function _concat(b1, b2) {
  const rval = new Uint8Array(b1.length + b2.length);
  rval.set(b1, 0);
  rval.set(b2, b1.length);
  return rval;
}

// sha hashing function
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

// ecdsa-sd-2023 method that uses invalid cbor tags
export function serializeDisclosureProofValue({
  baseSignature, publicKey, signatures, labelMap, mandatoryIndexes
} = {}) {
  const CBOR_PREFIX_DERIVED = new Uint8Array([0xd9, 0x5d, 0x01]);
  // encode as multibase (base64url no pad) CBOR
  const payload = [
    // Uint8Array
    baseSignature,
    // Uint8Array
    publicKey,
    // array of Uint8Arrays
    signatures,
    // Map of strings => strings compressed to ints => Uint8Arrays
    _compressLabelMap(labelMap),
    // array of numbers
    mandatoryIndexes
  ];
  const cbor = _concatBuffers([
    CBOR_PREFIX_DERIVED, cborg.encode(payload, {useMaps: true})
  ]);
  return `u${base64url.encode(cbor)}`;
}

function _concatBuffers(buffers) {
  const bytes = new Uint8Array(buffers.reduce((acc, b) => acc + b.length, 0));
  let offset = 0;
  for(const b of buffers) {
    bytes.set(b, offset);
    offset += b.length;
  }
  return bytes;
}

function _compressLabelMap(labelMap) {
  const map = new Map();
  for(const [k, v] of labelMap.entries()) {
    map.set(parseInt(k.slice(4), 10), base64url.decode(v.slice(1)));
  }
  return map;
}
