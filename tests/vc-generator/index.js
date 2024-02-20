/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as vc from '@digitalbazaar/vc';
import {cryptosuites} from './cryptosuites.js';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
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
 * @returns {Promise<Map>} Returns a Map of test data.
 */
export async function generateTestData({
  credential,
  suite,
  selectivePointers = [],
  mandatoryPointers = []
}) {
  const results = [];
  const keys = await getMultikeys();
  const cryptosuite = cryptosuites.get(suite);
  for(const prop in keys) {
    const {signer, issuer} = keys[prop];
    const _credential = klona(credential);
    _credential.issuer = issuer;
    const suite = new DataIntegrityProof({signer, cryptosuite});
    const _vc = await vc.issue({
      selectivePointers,
      mandatoryPointers,
      suite,
      signer,
      credential: _credential
    });
    results.push(_vc);
  }
  return results;
}
