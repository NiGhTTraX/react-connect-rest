import connectToRest from './connect';
import RestStore, { IRestStore } from './lib/rest-store';
import RestStoreMock from './lib/rest-store-mock';

export default connectToRest;

export {
  RestStore, IRestStore,
  RestStoreMock
};
