/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  deriveCredentials,
  issueCredentials
} from './vc-generator/index.js';
import {klona} from 'klona';

export async function sdVerifySetup({credentials, keyTypes, suite}) {
  const testVectors = {
    //signedCredentials
    signed: new Map(),
    disclosed: {
      //disclosedCredentials
      base: new Map(),
      //nestedDisclosedCredentials
      nested: new Map(),
      //disclosedDlCredentialNoIds
      noIds: new Map(),
      array: {
        //disclosedCredentialsWithFullArray
        full: new Map(),
        //disclosedCredentialsWithLessThanFullSubArray
        lessThanFull: new Map(),
        //disclosedCredentialsWithoutFirstArrayElement
        missingElements: new Map()
      }
    }
  };
  const {subjectNestedObjects, subjectHasArrays} = credentials.verify;
  // create initial signed VCs
  testVectors.signed = await issueCredentials({
    credentials: Object.entries(subjectNestedObjects),
    suite,
    keyTypes
  });
  // takes an object with keys versions values vector and
  // transforms the vectors
  const transformVectors = (obj, func) => Object.entries(obj).map(input => {
    const [vcVersion, vector] = input;
    return [vcVersion, func(klona(vector))];
  });
  const disclosedBaseVectors = transformVectors(
    subjectNestedObjects,
    vector => {
      vector.selectivePointers = ['/credentialSubject/id'];
      return vector;
    });
  // use initial VCs for a basic selective disclosure test
  testVectors.disclosed.base = await deriveCredentials({
    vectors: disclosedBaseVectors,
    suite,
    keyTypes
  });
  const disclosedNestedVectors = transformVectors(
    subjectNestedObjects,
    vector => {
      vector.selectivePointers = vector.selectivePointers.slice(1, 3);
      return vector;
    }
  );
  // create initial nestedDisclosedCredential from signedVc
  testVectors.disclosed.nested = await deriveCredentials({
    vectors: disclosedNestedVectors,
    suite,
    keyTypes
  });
  const disclosedNoIdVectors = transformVectors(
    subjectNestedObjects,
    vector => {
      // delete the vc id
      delete vector.document.id;
      // no idea why, but we reduce the pointers to?
      vector.selectivePointers = vector.selectivePointers.slice(1, 3);
      return vector;
    }
  );
  testVectors.disclosed.noIds = await deriveCredentials({
    vectors: disclosedNoIdVectors,
    keyTypes,
    suite
  });
  // select full arrays
  testVectors.disclosed.array.full = await deriveCredentials({
    vectors: Object.entries(klona(subjectHasArrays)),
    suite,
    keyTypes
  });
  const lessThanFullVectors = transformVectors(
    subjectHasArrays,
    vector => {
      // select less than full subarrays
      vector.selectivePointers = vector.selectivePointers.slice(2, -4);
      return vector;
    }
  );
  testVectors.disclosed.array.lessThanFull = await deriveCredentials({
    vectors: lessThanFullVectors,
    suite,
    keyTypes
  });
  const removeFirst7Vectors = transformVectors(
    subjectHasArrays,
    vector => {
      // select w/o first 7 array element
      vector.selectivePointers = vector.selectivePointers.slice(7);
      return vector;
    }
  );
  testVectors.disclosed.array.missingElements = await deriveCredentials({
    vectors: removeFirst7Vectors,
    suite,
    keyTypes
  });
  return testVectors;
}
