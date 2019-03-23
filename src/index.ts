import connectToRest from './connect';
import RestStore, { IRestStore, StoreModel } from './lib/rest-store';
import RestStoreMock from './lib/rest-store-mock';
import HttpRestClient, { PostPayload, PatchPayload, DeletePayload, RestModel, RestResponse } from './lib/http-rest-client';

export default connectToRest;

export {
  RestStore, IRestStore, StoreModel,
  HttpRestClient, PostPayload, PatchPayload, DeletePayload, RestModel, RestResponse,
  RestStoreMock
};
