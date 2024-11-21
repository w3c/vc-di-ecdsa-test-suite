/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
/* Note: This file contains data generated from the vc-di-ecdsa specification
test vectors. */

/* eslint-disable max-len */
/* eslint-disable quote-props */
/* eslint-disable quotes */
export const ecdsaSdVectors = {
  baseProof: {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      {
        "@vocab": "https://windsurf.grotto-networking.com/selective#"
      }
    ],
    "type": [
      "VerifiableCredential"
    ],
    "issuer": "https://vc.example/windsurf/racecommittee",
    "credentialSubject": {
      "sailNumber": "Earth101",
      "sails": [
        {
          "size": 5.5,
          "sailName": "Kihei",
          "year": 2023
        },
        {
          "size": 6.1,
          "sailName": "Lahaina",
          "year": 2023
        },
        {
          "size": 7,
          "sailName": "Lahaina",
          "year": 2020
        },
        {
          "size": 7.8,
          "sailName": "Lahaina",
          "year": 2023
        }
      ],
      "boards": [
        {
          "boardName": "CompFoil170",
          "brand": "Wailea",
          "year": 2022
        },
        {
          "boardName": "Kanaha Custom",
          "brand": "Wailea",
          "year": 2019
        }
      ]
    },
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "ecdsa-sd-2023",
      "created": "2023-08-15T23:36:38Z",
      "verificationMethod": "did:key:zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP#zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP",
      "proofPurpose": "assertionMethod",
      "proofValue": "u2V0AhVhAkWKMO8zpRmfcUMksHUMtZM7cJt8PmNLsljKTYhSi8gZ7wAWnK4BrOZkrH3dZvxKWlnxGG_0xlFXmU5sa5-j71VgjgCQCKnLOGbY_FuM-ASpSkkOxsIR2E8n7Ml2q1UQ6tEwzi5NYIAARIjNEVWZ3iJmqu8zd7v8AESIzRFVmd4iZqrvM3e7_jlhAKVYKM250DDcNWOYQpUmYC1Z5NZhJRwie8vVUev94QGst83WhoW7_UM6JULsKjNVHjxZlZQyovN4xw1M_mhn6TFhAsqMSgz0EeaPe0Hmo5SN1JNZmCjiZ-CNJB4ScmyK46s7hDotNZuGHxKGaAFC43O0FxcKeUC96q_z9PGeF5C3VpVhAmeoEU8I1ZzxFyR-QMxwoSkqRG9E8_CaSrhH8TD2t-tV32HKAC4hJkKl6xHuz6XL2G-V0cm6d_rWozjhmmVaMjVhAbQMMckpcMAEo15WC6C8Mo3bCEWFGtOTkMxND-LJMdfkCSovB7RnCR7SXzk5-0YVigtJ5Fzg71AAob5yg1WNNk1hApQHlYRGlUVkv-WX1OjJYJ19Ow7ipvVwUvm90Sn3IjNRLuy9pr5DHm3wVlVMPVpLqjS-E8_jJDeJV5pY0bfK_A1hAas2wx9bcEj0Sh7t8w9Cj-2FpceGpdRhaLZxYs1ZEG8-obUjb0CHOyH8S7uwDtn7oSW2oCW2SpZvlX-2jW17rmlhAe34eQ8-gJHyQahY0EmZh8mZoy0svnpTjkdcLnroLIBsiVkfCzMKLOWeEtWZUVnIBeugT8I2C7mnmpHNjdo2d4lhAM8okCUX8F4GYx9rlnSDvr5pTHPOjOOJ47JzFdDtX_Q4bZxWwLGwqltYojDecyt4oxQHYz55ZRnhTXLHqa74B7VhAO_Hj0vxsuJZzpVGtgoMKK2ZlGKvhLX3_vUCvdL-MTlszVr2iC3XJpCbOc8B_W_On-csaLPzUSvlSDtNec1ZVk1hAdm2Ht4sv_ec3s1HRqeul--yEGx4SrpwyNQRdLa5ZKyJDgqr4h-EtVNzc-J-VllvKrHN8wBKtUqarqI4Npnrx7VhAORMLXYz3l59Ozc7SDk2ej7clrer9Bn6eaBUQG773AqQ56bc-oGXeemekwZCNHjFLOESNoNq7qetO8FRbiFHb4FhAW-otSFVlUPFmg119n3TeSE7up5hBS34AqP2TGUQA5pDGyOTetrf8qq3bWj1lpCu1Z6yEZJlQ6nrLiCoaNVhpL1hA1wW_HhsTPUfUlqMX6ZMsLem8hbWaFe_rZDpPp5NN02vMHInDjO1Gn0BrXUyVAMnTY3fGrDjsuy2sGgMzR-bo11hAvOGSXH51eRoCWtV9LlpZD10ix0IuuVCnat5fRxU7hqGs0AzM09kGsmuDMRjowp51xhiFJ3iMajIOOhWUhPxHCoVnL2lzc3VlcngdL2NyZWRlbnRpYWxTdWJqZWN0L3NhaWxOdW1iZXJ4Gi9jcmVkZW50aWFsU3ViamVjdC9zYWlscy8xeCAvY3JlZGVudGlhbFN1YmplY3QvYm9hcmRzLzAveWVhcngaL2NyZWRlbnRpYWxTdWJqZWN0L3NhaWxzLzI"
    }
  },
  derivedProof: {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      {
        "@vocab": "https://windsurf.grotto-networking.com/selective#"
      }
    ],
    "type": [
      "VerifiableCredential"
    ],
    "issuer": "https://vc.example/windsurf/racecommittee",
    "credentialSubject": {
      "sailNumber": "Earth101",
      "sails": [
        {
          "size": 6.1,
          "sailName": "Lahaina",
          "year": 2023
        },
        {
          "size": 7,
          "sailName": "Lahaina",
          "year": 2020
        }
      ],
      "boards": [
        {
          "year": 2022,
          "boardName": "CompFoil170",
          "brand": "Wailea"
        },
        {
          "boardName": "Kanaha Custom",
          "brand": "Wailea",
          "year": 2019
        }
      ]
    },
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "ecdsa-sd-2023",
      "created": "2023-08-15T23:36:38Z",
      "verificationMethod": "did:key:zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP#zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP",
      "proofPurpose": "assertionMethod",
      "proofValue": "u2V0BhVhAkWKMO8zpRmfcUMksHUMtZM7cJt8PmNLsljKTYhSi8gZ7wAWnK4BrOZkrH3dZvxKWlnxGG_0xlFXmU5sa5-j71VgjgCQCKnLOGbY_FuM-ASpSkkOxsIR2E8n7Ml2q1UQ6tEwzi5OGWEBtAwxySlwwASjXlYLoLwyjdsIRYUa05OQzE0P4skx1-QJKi8HtGcJHtJfOTn7RhWKC0nkXODvUAChvnKDVY02TWEClAeVhEaVRWS_5ZfU6MlgnX07DuKm9XBS-b3RKfciM1Eu7L2mvkMebfBWVUw9WkuqNL4Tz-MkN4lXmljRt8r8DWEBqzbDH1twSPRKHu3zD0KP7YWlx4al1GFotnFizVkQbz6htSNvQIc7IfxLu7AO2fuhJbagJbZKlm-Vf7aNbXuuaWEA78ePS_Gy4lnOlUa2CgworZmUYq-Etff-9QK90v4xOWzNWvaILdcmkJs5zwH9b86f5yxos_NRK-VIO015zVlWTWEB2bYe3iy_95zezUdGp66X77IQbHhKunDI1BF0trlkrIkOCqviH4S1U3Nz4n5WWW8qsc3zAEq1Spquojg2mevHtWEA5EwtdjPeXn07NztIOTZ6PtyWt6v0Gfp5oFRAbvvcCpDnptz6gZd56Z6TBkI0eMUs4RI2g2rup607wVFuIUdvgpgBYIOGCDmZ9TBxEtWeCI9oVmRt0eHRGAaoOXx08gxL2IQt_AVggVkUuBrlOaELGVQWJD4M_qW5bcKEHWGNbOrPA_qAOKKwCWCBD6o5lQOWjNGwaTjq7H2Cn1-NPbwXLeDedy2YyiqL9TQNYIJEdvfdRibsv05I3pv8e6S1aUuAuBpGQHLhrYj4QX0knBFggk0AeXgJ4e6m1XsV5-xFud0L_1mUjZ9Mffhg5aZGTyDkFWCDYgT4e07o_IdCwae6qE7WZfpXtGRFESEXR3SxZmXE05o4AAQIFBggJCg4PEBESEw"
    }
  }
};
export const ecdsaRdfcVectors = {
  'P-256': {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://www.w3.org/ns/credentials/examples/v2"
    ],
    "id": "urn:uuid:58172aac-d8ba-11ed-83dd-0b3aef56cc33",
    "type": [
      "VerifiableCredential",
      "AlumniCredential"
    ],
    "name": "Alumni Credential",
    "description": "A minimum viable example of an Alumni Credential.",
    "issuer": "https://vc.example/issuers/5678",
    "validFrom": "2023-01-01T00:00:00Z",
    "credentialSubject": {
      "id": "did:example:abcdefgh",
      "alumniOf": "The School of Examples"
    },
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "ecdsa-rdfc-2019",
      "created": "2023-02-24T23:36:38Z",
      "verificationMethod": "did:key:zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP#zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP",
      "proofPurpose": "assertionMethod",
      "proofValue": "zaHXrr7AQdydBk3ahpCDpWbxfLokDqmCToYm2dyWvpcFVyWooC2he63w1f7UNQoAMKdhaRtcnaE2KTo5o5vTCcfw"
    }
  },
  'P-384': {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://www.w3.org/ns/credentials/examples/v2"
    ],
    "id": "urn:uuid:58172aac-d8ba-11ed-83dd-0b3aef56cc33",
    "type": [
      "VerifiableCredential",
      "AlumniCredential"
    ],
    "name": "Alumni Credential",
    "description": "A minimum viable example of an Alumni Credential.",
    "issuer": "https://vc.example/issuers/5678",
    "validFrom": "2023-01-01T00:00:00Z",
    "credentialSubject": {
      "id": "did:example:abcdefgh",
      "alumniOf": "The School of Examples"
    },
    "proof": {
      "type": "DataIntegrityProof",
      "cryptosuite": "ecdsa-rdfc-2019",
      "created": "2023-02-24T23:36:38Z",
      "verificationMethod": "did:key:z82LkuBieyGShVBhvtE2zoiD6Kma4tJGFtkAhxR5pfkp5QPw4LutoYWhvQCnGjdVn14kujQ#z82LkuBieyGShVBhvtE2zoiD6Kma4tJGFtkAhxR5pfkp5QPw4LutoYWhvQCnGjdVn14kujQ",
      "proofPurpose": "assertionMethod",
      "proofValue": "z967Mvv5bxtmLNqTzPZ8KmJjFmFXaAKeQNzq7GWnQkMcLtaGSSmuozE5WtJ8PipMe178B1tE28K1vsJur9bGVJhz6jgSJsRHFSQeqgH8hhjcg8gZDFJC1b9FsR5ggNmDBqHv"
    }
  }
};
export const ecdsaJcsVectors = {
  'P-256': {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://www.w3.org/ns/credentials/examples/v2"
    ],
    "id": "urn:uuid:58172aac-d8ba-11ed-83dd-0b3aef56cc33",
    "type": [
      "VerifiableCredential",
      "AlumniCredential"
    ],
    "name": "Alumni Credential",
    "description": "A minimum viable example of an Alumni Credential.",
    "issuer": "https://vc.example/issuers/5678",
    "validFrom": "2023-01-01T00:00:00Z",
    "credentialSubject": {
      "id": "did:example:abcdefgh",
      "alumniOf": "The School of Examples"
    },
    "proof": {
      "type": "DataIntegrityProof",
      "created": "2023-02-24T23:36:38Z",
      "verificationMethod": "did:key:zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP#zDnaepBuvsQ8cpsWrVKw8fbpGpvPeNSjVPTWoq6cRqaYzBKVP",
      "cryptosuite": "ecdsa-jcs-2019",
      "proofPurpose": "assertionMethod",
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/examples/v2"
      ],
      "proofValue": "z48fSpWLud2PXMmBjRnacU3oE4WMHX4J1hx7qjc2K31x1aoVfLPCcpEincvjUg8ptbDnrYgcytmSj51Uj2Ap3a7WB"
    }
  },
  'P-384': {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://www.w3.org/ns/credentials/examples/v2"
    ],
    "id": "urn:uuid:58172aac-d8ba-11ed-83dd-0b3aef56cc33",
    "type": [
      "VerifiableCredential",
      "AlumniCredential"
    ],
    "name": "Alumni Credential",
    "description": "A minimum viable example of an Alumni Credential.",
    "issuer": "https://vc.example/issuers/5678",
    "validFrom": "2023-01-01T00:00:00Z",
    "credentialSubject": {
      "id": "did:example:abcdefgh",
      "alumniOf": "The School of Examples"
    },
    "proof": {
      "type": "DataIntegrityProof",
      "created": "2023-02-24T23:36:38Z",
      "verificationMethod": "did:key:z82LkuBieyGShVBhvtE2zoiD6Kma4tJGFtkAhxR5pfkp5QPw4LutoYWhvQCnGjdVn14kujQ#z82LkuBieyGShVBhvtE2zoiD6Kma4tJGFtkAhxR5pfkp5QPw4LutoYWhvQCnGjdVn14kujQ",
      "cryptosuite": "ecdsa-jcs-2019",
      "proofPurpose": "assertionMethod",
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/examples/v2"
      ],
      "proofValue": "zasuhHXVzmepTMgSuyWvCCY3gYbLpANXDYWSuemx7WjopwRr6DDN532dKSMoxqNeQm7BWZxqyurFLSPBDmzaHe57k7JgGRaNtJhjfYjgww19nPWdP7dYqqf1X1LvNEcZJP75"
    }
  }
};
