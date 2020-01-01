/* istanbul ignore file */
import connectToRest from './connect';
import RestStore, { IRestStore, StoreModel } from './lib/rest-store';
import RestStoreMock from './lib/rest-store-mock';
import HttpRestClient, { PostPayload, PatchPayload, DeletePayload, RestModel, RestResponse } from './lib/http-rest-client';
import FetchClient from './lib/fetch-client';

export default connectToRest;

export {
  RestStore, IRestStore, StoreModel,
  FetchClient, HttpRestClient,
  PostPayload, PatchPayload, DeletePayload, RestModel, RestResponse,
  RestStoreMock
};
