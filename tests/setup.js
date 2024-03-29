/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  deriveCredentials,
  issueCredential,
  issueCredentials
} from './vc-generator/index.js';
import {klona} from 'klona';

export async function sdVerifySetup({credentials, vectors}) {
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
  const {keyTypes} = vectors;
  // create initial signed VCs
  testVectors.signed = await issueCredentials({
    credentials: Object.entries(subjectNestedObjects),
    suite,
    keyTypes
  });
  // use initial VCs for a basic selective disclosure test
  testVectors.disclosed.base = await deriveCredentials({
    selectivePointers: ['/credentialSubject/id'],
    verifiableCredentials: testVectors.signed,
    suite
  });
  // create initial nestedDisclosedCredential from signedVc
  testVectors.disclosed.nested = await deriveCredentials({
    selectivePointers: subjectNestedObjects.selectivePointers.slice(1, 3),
    verifiableCredential: testVectors.signed,
    suite
  });
  // copy the first vc
  const noIdVc = klona(subjectNestedObjects.document);
  // delete the id
  delete noIdVc.id;
  // start second round test data creation w/ dlCredentialNoIds
  const noIdsVcs = await issueCredential({
    credential: noIdVc,
    keyTypes,
    suite: 'ecdsa-sd-2023',
    mandatoryPointers: subjectNestedObjects.mandatoryPointers
  });
  const signedDlCredentialNoIds = noIdsVcs.get(keyTypes[0]);
  testVectors.disclosed.noIds = await deriveCredentials({
    selectivePointers: subjectNestedObjects.selectivePointers.slice(1, 3),
    verifiableCredential: signedDlCredentialNoIds,
    keyTypes,
    suite
  });
  const credentialHasArrays = klona(subjectHasArrays);
  // start third round test data creation w/
  // AchievementCredential
  const achievementCredentials = await issueCredentials({
    credential: Object.entries(credentialHasArrays),
    keyTypes,
    suite
  });
  const signedAchievementCredential = achievementCredentials.get(
    keyTypes[0]);
  // select full arrays
  testVectors.disclosed.array.full = await deriveCredentials({
    selectivePointers: [...credentialHasArrays.selectivePointers],
    verifiableCredential: signedAchievementCredential,
    suite,
    keyTypes
  });
  // select less than full subarrays
  const lessThanFullPointers = credentialHasArrays.
    selectivePointers.slice(2, -4);
  testVectors.disclosed.array.lessThanFull = await deriveCredentials({
    selectivePointers: lessThanFullPointers,
    verifiableCredential: signedAchievementCredential,
    suite,
    keyTypes
  });
  // select w/o first 7 array element
  const removeFirst7Pointers = credentialHasArrays.
    selectivePointers.slice(7);
  testVectors.disclosed.array.missingElements = await deriveCredentials({
    selectivePointers: removeFirst7Pointers,
    verifiableCredential: signedAchievementCredential,
    suite,
    keyTypes
  });
  return testVectors;
}
