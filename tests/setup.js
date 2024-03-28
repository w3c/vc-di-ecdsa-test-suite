/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  deriveTestData,
  issueCredential,
  issueCredentials
} from './vc-generator/index.js';
import {klona} from 'klona';

export async function sdVerifySetup({credentials, vectors}) {
  const testVectors = {
    //signedCredentials
    signed: [],
    disclosed: {
      //disclosedCredentials
      base: [],
      //nestedDisclosedCredentials
      nested: [],
      //disclosedDlCredentialNoIds
      noIds: [],
      array: {
        //disclosedCredentialsWithFullArray
        full: [],
        //disclosedCredentialsWithLessThanFullSubArray
        lessThanFull: [],
        //disclosedCredentialsWithoutFirstArrayElement
        missingElements: []
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
  const signedVc = testVectors.signed.get(keyTypes[0]);
  // use initial VCs for a basic selective disclosure test
  testVectors.disclosed.base = await deriveTestData({
    selectivePointers: ['/credentialSubject/id'],
    verifiableCredential: signedVc,
    keyTypes,
    suite
  });
  // create initial nestedDisclosedCredential from signedVc
  testVectors.disclosed.nested = await deriveTestData({
    selectivePointers: subjectNestedObjects.selectivePointers.slice(1, 3),
    verifiableCredential: signedVc,
    keyTypes,
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
  testVectors.disclosed.noIds = await deriveTestData({
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
  testVectors.disclosed.array.full = await deriveTestData({
    selectivePointers:
      [...credentialHasArrays.selectivePointers],
    verifiableCredential: signedAchievementCredential,
    suite,
    keyTypes
  });
  // select less than full subarrays
  const lessThanFullPointers = credentialHasArrays.
    selectivePointers.slice(2, -4);
  testVectors.disclosed.array.lessThanFull = await deriveTestData({
    selectivePointers: lessThanFullPointers,
    verifiableCredential: signedAchievementCredential,
    suite,
    keyTypes
  });
  // select w/o first 7 array element
  const removeFirst7Pointers = credentialHasArrays.
    selectivePointers.slice(7);
  testVectors.disclosed.array.missingElements = await deriveTestData({
    selectivePointers: removeFirst7Pointers,
    verifiableCredential: signedAchievementCredential,
    suite,
    keyTypes
  });
  return testVectors;
}
