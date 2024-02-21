/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as vc from '@digitalbazaar/vc';
import {cryptosuites} from './cryptosuites.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {getMultikeys} from './key-gen.js';
import {klona} from 'klona';

/**
 * Issues test data locally and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {object} options.credential - An unsigned VC.
 * @param {string} options.suite - A cryptosuite id.
 * @param {Array<string>} options.mandatoryPointers - An optional list of
 *   json pointers.
 *
 * @returns {Promise<Map<string, object>>} Returns a Map of test data.
 */
export async function issueTestData({
  credential,
  suite,
  mandatoryPointers = []
}) {
  const results = new Map();
  const keys = await getMultikeys();
  const cryptosuite = cryptosuites.get(suite);
  for(const [curve, {signer, issuer}] of keys) {
    const _credential = klona(credential);
    _credential.issuer = issuer;
    const suite = new DataIntegrityProof({
      signer,
      cryptosuite,
      mandatoryPointers,
    });
    const _vc = await vc.issue({
      credential: _credential,
      documentLoader,
      mandatoryPointers,
      suite,
      signer,
    });
    results.set(curve, _vc);
  }
  return results;
}

/**
 * Issues test data locally and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {object} options.verifiableCredential - A signed VC.
 * @param {string} options.suite - A cryptosuite id.
 * @param {Array<string>} options.selectivePointers - An optional list of json
 *   pointers.
 *
 * @returns {Promise<Map<string, object>>} Returns a Map of test data.
 */
export async function deriveTestData({
  verifiableCredential,
  suite,
  selectivePointers = []
}) {
  const results = new Map();
  const keys = await getMultikeys();
  const cryptosuite = cryptosuites.get(suite);
  for(const [curve, {signer}] of keys) {
    const suite = new DataIntegrityProof({
      signer,
      cryptosuite,
      proofId: verifiableCredential?.proof?.id,
      selectivePointers
    });
    const _vc = await vc.derive({
      verifiableCredential,
      documentLoader,
      selectivePointers,
      suite,
      signer,
    });
    results.set(curve, _vc);
  }
  return results;
}
