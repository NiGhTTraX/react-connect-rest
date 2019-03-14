import connectToRest from './connect';
import RestCollectionStore from './lib/rest-collection-store';
import RestCollectionStoreMock from './lib/rest-collection-store-mock';
import { IRestCollectionStore } from './lib/rest';

export default connectToRest;

export { RestCollectionStore, IRestCollectionStore, RestCollectionStoreMock };
