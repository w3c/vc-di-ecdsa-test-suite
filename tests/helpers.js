/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import {klona} from 'klona';
import {v4 as uuidv4} from 'uuid';

export const createInitialVc = async ({issuer, vc}) => {
  const {settings: {id: issuerId, options}} = issuer;
  const credential = klona(vc);
  credential.id = `urn:uuid:${uuidv4()}`;
  credential.issuer = issuerId;
  const body = {credential, options};
  const {data, error} = await issuer.post({json: body});
  if(error) {
    throw error;
  }
  return data;
};
