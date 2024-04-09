/*!
 * Copyright 2024 Digital Bazaar, Inc.
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {
  getColumnNameForTestCategory,
  setupReportableTestSuite
} from './helpers.js';

import {annotateReportableTest} from './helpers.js';
import {getSuiteConfig} from './test-config.js';
import {
  endpoints as registeredImplementations
} from 'vc-test-suite-implementations';

export async function defineSuiteConformanceTests({
  suite, testCategory, buildTestVectorsFn
}, fn) {
  const {
    tags,
    credentials,
    vectors: {
      keyTypes: requiredSupportedKeyTypes,
      vcTypes: vcVersions
    },
  } = getSuiteConfig(suite);

  const {match: targetImplementations} = registeredImplementations.filterByTag({
    tags: [...tags],
    property: testCategory
  });

  const testVectorsByKeyType = await buildTestVectorsFn(
    suite, credentials, requiredSupportedKeyTypes
  );

  const getTestVector = (vcVersion, keyType) =>
    testVectorsByKeyType?.get(keyType)?.get(vcVersion) ?? null;

  const config = {
    suite,
    testCategory,
    versions: vcVersions.map(version => ({
      vc: version,
      requiredKeyTypes: requiredSupportedKeyTypes
    }))
  };

  /**
   * For every VC version, defines a block of tests for each implementation.
   *
   * For each implementation's required keyTypes (as indicated per suite),
   * insert the provided test suites and provide additional context.
   */
  config.versions.map(({vc, requiredKeyTypes}) => {
    describe(`${suite} (${testCategory} ${vc})`, function() {
      setupReportableTestSuite(this,
        getColumnNameForTestCategory(testCategory)
      );

      for(const [name, {endpoints}] of targetImplementations) {
        for(const ep of endpoints) {
          const {
            supportedEcdsaKeyTypes
          } = ep.settings;

          for(const keyType of requiredKeyTypes) {
            const supportsKeyType = supportedEcdsaKeyTypes.includes(keyType);

            const testVector = supportsKeyType ?
              getTestVector(vc, keyType) : null;

            const implementationTitle = `${name}: ${keyType}`;
            this.implemented.push(implementationTitle);

            describe(implementationTitle, function() {
              beforeEach(function() {
                annotateReportableTest(this, {
                  implementationName: name,
                  keyType
                });
              });

              const perTestCommonArgs = {
                suiteName: suite,
                implementationName: name,
                vcVersion: vc,
                keyType,
                endpoint: ep,
                testCategory,
                testVector,
              };

              fn.apply(this, [perTestCommonArgs]);
            });
          }
        }
      }
    });
  });
}
