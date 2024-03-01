/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as vc from '@digitalbazaar/vc';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {getMultikeys} from './key-gen.js';
import {getSuite} from './cryptosuites.js';
import {klona} from 'klona';

/**
 * Issues test data locally and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {Map<string, object>} options.credentials - Versioned unsigned
 *   credentials.
 * @param {string} options.suite - A cryptosuite id.
 * @param {Array<string>} options.keyTypes - A Set of keyTypes to issue with.
 *
 * @returns {Promise<Map<string, object>>} Returns a Map <keyType, vc>.
 */
export async function issueCredentials({
  credentials,
  suite,
  keyTypes = ['P-256']
}) {
  const results = new Map();
  const keys = await getMultikeys({keyTypes});
  for(const [keyType, {signer, issuer}] of keys) {
    const versionedVcs = new Map();
    for(const [vcVersion, {document, mandatoryPointers}] of credentials) {
      const _vc = await issueCredential({
        credential: document,
        issuer,
        signer,
        suite,
        mandatoryPointers
      });
      versionedVcs.set(vcVersion, _vc);
    }
    results.set(keyType, versionedVcs);
  }
  return results;
}

export async function issueCredential({
  credential,
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
 * @param {Map<string, object>} options.vectors - Version & VC creation options.
 * @param {string} options.suite - A cryptosuite id.
 * @param {Array<string>} options.keyTypes - A list of key types.
 *
 * @returns {Promise<Map<string, object>>} Returns a Map <keyType, vc>.
 */
export async function deriveCredentials({
  vectors,
  suite,
  keyTypes = ['P-256']
}) {
  const results = new Map();
  const keys = await getMultikeys({keyTypes});
  for(const [keyType, {signer, issuer}] of keys) {
    const versionedVcs = new Map();
    for(const [vcVersion, vector] of vectors) {
      const {document, mandatoryPointers, selectivePointers} = vector;
      const verifiableCredential = await issueCredential({
        credential: document,
        issuer,
        signer,
        suite,
        mandatoryPointers
      });
      const derivedVc = await deriveCredential({
        verifiableCredential,
        documentLoader,
        suite,
        signer,
        selectivePointers
      });
      versionedVcs.set(vcVersion, derivedVc);
    }
    results.set(keyType, versionedVcs);
  }
  return results;
}

export async function deriveCredential({
  verifiableCredential,
  documentLoader,
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
