/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {createRequire} from 'node:module';
import {klona} from 'klona';
import {v4 as uuidv4} from 'uuid';

export const require = createRequire(import.meta.url);

// Javascript's default ISO timestamp contains milliseconds.
// This lops off the MS part of the UTC RFC3339 TimeStamp and replaces
// it with a terminal Z.
export const ISOTimeStamp = ({date = new Date()} = {}) => {
  return date.toISOString().replace(/\.\d+Z$/, 'Z');
};

/**
 * Creates an initial VC.
 *
 * @param {object} options - Options to use.
 * @param {object} options.issuer - An endpoint with a post method.
 * @param {object} options.vc - The credential to be issued.
 * @param {Array<string>} [options.mandatoryPointers] - An optional
 *   array of mandatory pointers.
 *
 * @returns {Promise<object>} The resulting issuance result.
 */
export const createInitialVc = async ({issuer, vc, mandatoryPointers}) => {
  const {settings: {id: issuerId, options}} = issuer;
  const credential = klona(vc);
  credential.id = `urn:uuid:${uuidv4()}`;
  credential.issuer = issuerId;
  credential.issuanceDate = ISOTimeStamp();
  const body = {credential, options};
  // if there are mandatoryPointers for sd tests add them
  if(Array.isArray(mandatoryPointers)) {
    options.mandatoryPointers = mandatoryPointers;
  }
  const {data} = await issuer.post({json: body});
  return data;
};

export const createDisclosedVc = async ({
  selectivePointers = [], signedCredential, vcHolder
}) => {
  const {data} = await vcHolder.post({
    json: {
      options: {
        selectivePointers
      },
      verifiableCredential: signedCredential
    }
  });
  return {disclosedCredential: data};
};

export const SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS = new Map([
  ['P-256', 'zDna'],
  ['P-384', 'z82L']
]);

export const multibaseMultikeyHeaderP256 =
  SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS.get('P-256');

export const multibaseMultikeyHeaderP384 =
  SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS.get('P-384');
