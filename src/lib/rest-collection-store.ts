import { Omit } from 'react-bind-component';
import TransportLayer from './transport-layer';
import FetchTransport from './fetch-transport';
import { IRestCollectionStore } from './rest';
import { RestStore } from './rest-store';

/**
 * Fetch and offer methods to mutate a REST collection.
 */
// eslint-disable-next-line max-len
export default class RestCollectionStore<T extends { id: any }> extends RestStore<T, T[]> implements IRestCollectionStore<T> {
  constructor(api: string, transportLayer: TransportLayer = FetchTransport) {
    super(api, [], transportLayer);
  }

  post = async (payload: Partial<Omit<T, 'id'>>) => {
    const response = await this.transportLayer.post<T>(this.api, payload as Partial<T>);

    await this.fetchData();

    return response;
  };

  delete = async (payload: Pick<T, 'id'>) => {
    await this.transportLayer.delete(this.api, payload);
    await this.fetchData();
    return Promise.resolve(this.state.response);
  };
}
