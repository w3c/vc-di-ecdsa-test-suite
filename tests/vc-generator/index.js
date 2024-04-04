/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as vc from '@digitalbazaar/vc';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader as defaultLoader} from './documentLoader.js';
import {getMultikeys} from './key-gen.js';
import {getSuite} from './cryptosuites.js';
import {klona} from 'klona';

/**
 * Issues test data locally and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {object} options.credential - An unsigned VC.
 * @param {Function} [options.documentLoader = defaultLoader] - A
 * documentLoader(url).
 * @param {string} options.suite - A cryptosuite id.
 * @param {Array<string>} options.mandatoryPointers - An optional list of
 *   json pointers.
 * @param {Array<string>} options.keyTypes - A Set of keyTypes to issue with.
 *
 * @returns {Promise<Map<string, object>>} Returns a Map <keyType, vc>.
 */
export async function issueTestData({
  credential,
  suite,
  documentLoader = defaultLoader,
  mandatoryPointers,
  keyTypes = ['P-256']
}) {
  const results = new Map();
  const keys = await getMultikeys({keyTypes});
  for(const [keyType, {signer, issuer}] of keys) {
    const _vc = await issueCredential({
      credential,
      documentLoader,
      issuer,
      signer,
      suite,
      mandatoryPointers
    });
    results.set(keyType, _vc);
  }
  return results;
}

export async function issueCredential({
  credential,
  documentLoader = defaultLoader,
  issuer,
  signer,
  suite,
  mandatoryPointers = []
}) {
  const _credential = klona(credential);
  _credential.issuer = issuer;
  const cryptosuite = getSuite({suite, mandatoryPointers});
  return vc.issue({
    credential: _credential,
    documentLoader,
    suite: new DataIntegrityProof({signer, cryptosuite})
  });
}

/**
 * Derives test data locally and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {Function} [options.documentLoader = defaultLoader] - A
 * documentLoader(url).
 * @param {object} options.verifiableCredential - A signed VC.
 * @param {string} options.suite - A cryptosuite id.
 * @param {Array<string>} options.selectivePointers - An optional list of json
 *   pointers.
 * @param {Array<string>} options.keyTypes - A list of key types.
 *
 * @returns {Promise<Map<string, object>>} Returns a Map <keyType, vc>.
 */
export async function deriveTestData({
  documentLoader = defaultLoader,
  verifiableCredential,
  suite,
  selectivePointers = [],
  keyTypes = ['P-256']
}) {
  const results = new Map();
  const keys = await getMultikeys({keyTypes});
  for(const [keyType, {signer}] of keys) {
    const _vc = await deriveCredential({
      verifiableCredential,
      documentLoader,
      suite,
      signer,
      selectivePointers
    });
    results.set(keyType, _vc);
  }
  return results;
}

export async function deriveCredential({
  documentLoader = defaultLoader,
  verifiableCredential,
  suite,
  signer,
  selectivePointers = []
}) {
  return vc.derive({
    verifiableCredential,
    documentLoader,
    suite: new DataIntegrityProof({
      signer,
      cryptosuite: getSuite({suite, selectivePointers})
    })
  });
}
