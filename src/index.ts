import connectToRest from './connect';
import { IRestCollectionStore, IRestEntityStore } from './lib/rest';
import RestCollectionStore from './lib/rest-collection-store';
import RestEntityStore from './lib/rest-entity-store';
import RestCollectionStoreMock from './lib/rest-collection-store-mock';

export default connectToRest;

export {
  RestCollectionStore, IRestCollectionStore,
  RestEntityStore, IRestEntityStore,
  RestCollectionStoreMock
};
