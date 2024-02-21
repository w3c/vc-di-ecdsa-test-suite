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
 * Calls the vc generators and then returns a Map
 * with the test data.
 *
 * @param {object} options - Options to use.
 * @param {object} options.credential - An unsigned VC.
 * @param {string} options.suite - A cryptosuite id.
 * @param {Array<string>} options.selectivePointers - An optional list of json
 *   pointers.
 * @param {Array<string>} options.mandatoryPointers - An optional list of
 *   json pointers.
 *
 * @returns {Promise<Map<string, object>>} Returns a Map of test data.
 */
export async function generateTestData({
  credential,
  suite,
  mandatoryPointers = [],
  selectivePointers = []
}) {
  const results = new Map();
  const keys = await getMultikeys();
  const cryptosuite = cryptosuites.get(suite);
  for(const [curve, {signer, issuer}] of keys) {
    const _credential = klona(credential);
    _credential.issuer = issuer;
    const suite = new DataIntegrityProof({signer, cryptosuite});
    const _vc = await vc.issue({
      credential: _credential,
      documentLoader,
      mandatoryPointers,
      selectivePointers,
      suite,
      signer,
    });
    results.set(curve, _vc);
  }
  return results;
}
