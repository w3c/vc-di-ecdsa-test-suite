/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {createInitialVc} from './helpers.js';
import {endpoints} from 'vc-test-suite-implementations';
import {validVc as vc} from './mock-data.js';
import {verificationSuccess} from './assertions.js';

const tag = 'ecdsa-rdfc-2019';

// only use implementations with `ecdsa-rdfc-2019` issuers.
const {
  match: issuerMatches
} = endpoints.filterByTag({tags: [tag], property: 'issuers'});
const {
  match: verifierMatches
} = endpoints.filterByTag({tags: [tag], property: 'verifiers'});

describe('ecdsa-rdfc-2019 (interop)', function() {
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.implemented = [];
  this.rowLabel = 'Issuer';
  this.columnLabel = 'Verifier';

  const issuers = [];
  for(const [issuerName, {endpoints}] of issuerMatches) {
    for(const issuerEndpoint of endpoints) {
      const {supportedEcdsaKeyTypes} = issuerEndpoint.settings;
      const issuerDisplayName =
        `${issuerName}: ${supportedEcdsaKeyTypes.join(', ')}`;
      for(const issuerSupportedEcdsaKeyType of supportedEcdsaKeyTypes) {
        issuers.push({
          issuerDisplayName,
          issuerSupportedEcdsaKeyType,
          issuerEndpoint
        });
      }
    }
  }

  const verifiers = [];
  for(const [verifierName, {endpoints}] of verifierMatches) {
    for(const verifierEndpoint of endpoints) {
      const {supportedEcdsaKeyTypes} = verifierEndpoint.settings;
      const verifierDisplayName =
        `${verifierName}: ${supportedEcdsaKeyTypes.join(', ')}`;
      verifiers.push({
        verifierDisplayName,
        verifierSupportedEcdsaKeyTypes: supportedEcdsaKeyTypes,
        verifierEndpoint
      });
      // add verifiers' names for reporting
      this.implemented.push(verifierDisplayName);
    }
  }

  for(const {
    issuerDisplayName, issuerSupportedEcdsaKeyType, issuerEndpoint
  } of issuers) {
    for(const {
      verifierDisplayName, verifierSupportedEcdsaKeyTypes, verifierEndpoint
    } of verifiers) {
      if(
        !verifierSupportedEcdsaKeyTypes.includes(issuerSupportedEcdsaKeyType)
      ) {
        // If the issuer keyType is not supported by the verifier
        // we skip that case
        continue;
      }
      let issuedVc;
      before(async function() {
        issuedVc = await createInitialVc({issuer: issuerEndpoint, vc});
      });
      it(`"${verifierDisplayName}" should verify "${issuerDisplayName}"`,
        async function() {
          this.test.cell = {
            rowId: issuerDisplayName,
            columnId: verifierDisplayName
          };
          await verificationSuccess({
            credential: issuedVc, verifier: verifierEndpoint
          });
        });
    }
  }
});
