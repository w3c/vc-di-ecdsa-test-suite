/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
export const validVc = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      '@protected': true,
      DriverLicenseCredential: 'urn:example:DriverLicenseCredential',
      DriverLicense: {
        '@id': 'urn:example:DriverLicense',
        '@context': {
          '@protected': true,
          id: '@id',
          type: '@type',
          documentIdentifier: 'urn:example:documentIdentifier',
          dateOfBirth: 'urn:example:dateOfBirth',
          expirationDate: 'urn:example:expiration',
          issuingAuthority: 'urn:example:issuingAuthority'
        }
      },
      driverLicense: {
        '@id': 'urn:example:driverLicense',
        '@type': '@id'
      }
    }
  ],
  id: 'urn:uuid:36245ee9-9074-4b05-a777-febff2e69757',
  type: ['VerifiableCredential', 'DriverLicenseCredential'],
  credentialSubject: {
    id: 'urn:uuid:1a0e4ef5-091f-4060-842e-18e519ab9440',
    driverLicense: {
      type: 'DriverLicense',
      documentIdentifier: 'T21387yc328c7y32h23f23',
      dateOfBirth: '01-01-1990',
      expirationDate: '01-01-2030',
      issuingAuthority: 'VA'
    }
  }
};

export const dlCredentialNoIds = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      '@protected': true,
      DriverLicenseCredential: 'urn:example:DriverLicenseCredential',
      DriverLicense: {
        '@id': 'urn:example:DriverLicense',
        '@context': {
          '@protected': true,
          id: '@id',
          type: '@type',
          documentIdentifier: 'urn:example:documentIdentifier',
          dateOfBirth: 'urn:example:dateOfBirth',
          expirationDate: 'urn:example:expiration',
          issuingAuthority: 'urn:example:issuingAuthority'
        }
      },
      driverLicense: {
        '@id': 'urn:example:driverLicense',
        '@type': '@id'
      }
    },
  ],
  type: ['VerifiableCredential', 'DriverLicenseCredential'],
  credentialSubject: {
    driverLicense: {
      type: 'DriverLicense',
      documentIdentifier: 'T21387yc328c7y32h23f23',
      dateOfBirth: '01-01-1990',
      expirationDate: '01-01-2030',
      issuingAuthority: 'VA'
    }
  }
};

export const achievementCredential = {
  '@context': [
    'https://www.w3.org/ns/credentials/v2',
    'https://www.w3.org/ns/credentials/examples/v2'
  ],
  type: ['VerifiableCredential', 'ExampleAchievementCredential'],
  credentialSubject: {
    name: 'Jane Doe',
    achievements: [{
      type: 'WindsailingAchievement',
      sailNumber: 'Earth101',
      sails: [
        {
          size: 5.5,
          sailName: 'Osprey',
          year: 2023
        },
        {
          size: 6.1,
          sailName: 'Eagle-FR',
          year: 2023
        },
        {
          size: 7.0,
          sailName: 'Eagle-FR',
          year: 2020
        },
        {
          size: 7.8,
          sailName: 'Eagle-FR',
          year: 2023
        }
      ],
      boards: [
        {
          boardName: 'CompFoil170',
          brand: 'Tillo',
          year: 2022
        },
        {
          boardName: 'Tillo Custom',
          brand: 'Tillo',
          year: 2019
        }
      ]
    }, {
      type: 'WindsailingAchievement',
      sailNumber: 'Mars101',
      sails: [
        {
          size: 5.9,
          sailName: 'Chicken',
          year: 2022
        },
        {
          size: 4.9,
          sailName: 'Vulture-FR',
          year: 2023
        },
        {
          size: 6.8,
          sailName: 'Vulture-FR',
          year: 2020
        },
        {
          size: 7.7,
          sailName: 'Vulture-FR',
          year: 2023
        }
      ],
      boards: [
        {
          boardName: 'Oak620',
          brand: 'Excite',
          year: 2020
        },
        {
          boardName: 'Excite Custom',
          brand: 'Excite',
          year: 2018
        }
      ]
    }]
  }
};
