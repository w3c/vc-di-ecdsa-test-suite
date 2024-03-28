// Rename this file to localConfig.cjs
// you can specify a BASE_URL before running the tests such as:
// BASE_URL=http://localhost:40443/zDdfsdfs npm test
const baseUrl = process.env.BASE_URL || 'https://localhost:40443/id';
module.exports = [{
  name: 'My Company',
  implementation: 'My Implementation Name',
  // only this implementation will be run in the suite
  only: true,
  issuers: [{
    id: 'did:myMethod:implementation:issuer:id',
    endpoint: `${baseUrl}/credentials/issue`,
    supportedEcdsaKeyTypes: ['P-256', 'P-384'],
    tags: ['ecdsa-rdfc-2019', 'localhost']
  }],
  verifiers: [{
    id: 'did:myMethod:implementation:verifier:id',
    endpoint: `${baseUrl}/credentials/verify`,
    supportedEcdsaKeyTypes: ['P-256', 'P-384'],
    tags: ['ecdsa-rdfc-2019', 'localhost']
  }]
}];
