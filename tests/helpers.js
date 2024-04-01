/*!
 * Copyright 2023 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as bs58 from 'base58-universal';
import * as bs64 from 'base64url-universal';
import {createRequire} from 'node:module';
import {klona} from 'klona';
import {v4 as uuidv4} from 'uuid';

export const require = createRequire(import.meta.url);

// takes a multibase string starting with z lops the z off
// and gets the bytes
export const getBs58Bytes = async s => bs58.decode(s.slice(1));
export const getBs64UrlBytes = async s => bs64.decode(s.slice(1));

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
  const {data, result, error} = await issuer.post({json: body});
  if(!result || !result.ok) {
    throw new Error(
      'Test setup failed: createInitialVC failed with error',
      {cause: error.message}
    );
  }
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
  ['P-384', 'z82L'],
  ['Ed25519', 'z6Mk']
]);

export const multibaseMultikeyHeaderP256 =
  SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS.get('P-256');

export const multibaseMultikeyHeaderP384 =
  SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS.get('P-384');

export const multibaseMultikeyHeaderEd25519 =
  SUPPORTED_BASE58_ECDSA_MULTIKEY_HEADERS.get('Ed25519');

/**
 * Builds a result cell for the test reporter with the expected parameters.
 *
 * This is used to annotate the test results with the implementation name and
 * test name.
 *
 * @param {object} object - The object to use for building the result cell.
 * @param {string} object.name - The name of the implementation.
 * @param {string} object.keyType - The `keyType` being tested (e.g., `P-256`).
 * @param {string} object.testTitle - The title of the test.
 * @returns {object} The result cell object.
 */
export const buildResultCell = ({name, keyType, testTitle}) => ({
  columnId: `${name}: ${keyType}`, rowId: testTitle
});

export function annotateReportableTest(testContext, {
  implementationName, keyType
}) {
  testContext.test.cell = buildResultCell({
    name: implementationName,
    keyType,
    testTitle: testContext.test.title
  });
}

export function setupReportableTestSuite(runnerContext, name) {
  runnerContext.matrix = true;
  runnerContext.report = true;
  runnerContext.rowLabel = 'Test Name';
  runnerContext.columnLabel = name;

  runnerContext.implemented = [];
}
