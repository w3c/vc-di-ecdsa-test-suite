/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {didResolver} from './didResolver.js';
import {httpClient} from '@digitalbazaar/http-client';
import https from 'node:https';
import {JsonLdDocumentLoader} from 'jsonld-document-loader';

const agent = new https.Agent({rejectUnauthorized: false});
const httpClientHandler = {
  async get({url}) {
    if(!url.startsWith('http')) {
      throw new Error('NotFoundError');
    }
    let result;
    try {
      result = await httpClient.get(url, {agent});
    } catch(e) {
      throw new Error('NotFoundError');
    }
    return result.data;
  }
};

const jdl = new JsonLdDocumentLoader();

jdl.setProtocolHandler({protocol: 'http', handler: httpClientHandler});
jdl.setProtocolHandler({protocol: 'https', handler: httpClientHandler});

const webLoader = jdl.build();

export async function documentLoader({url}) {
  // resolve all DID URLs through didKeyDriver
  if(url.startsWith('did:')) {
    return didResolver({url});
  }
  // use web loader if the URL is a HTTP URL
  if(url.startsWith('http')) {
    return webLoader(url);
  }
}
