import { StateContainer } from 'react-connect-state';
import { Omit } from 'react-bind-component';
import TransportLayer from './transport-layer';
import FetchTransport from './fetch-transport';
import { IRestCollectionStore, PatchPayload, RestCollectionState } from './rest';

/**
 * Fetch and offer methods to mutate a REST collection.
 */
// eslint-disable-next-line max-len
export default class RestCollectionStore<T extends { id: any }> extends StateContainer<RestCollectionState<T>> implements IRestCollectionStore<T> {
  protected readonly api: string;

  protected readonly transportLayer: TransportLayer;

  constructor(api: string, transportLayer: TransportLayer = FetchTransport) {
    super();

    this.transportLayer = transportLayer;
    this.api = api;

    this.state = {
      loading: true,
      response: []
    };

    this.fetchData();
  }

  post = async (payload: Partial<Omit<T, 'id'>>) => {
    const response = await this.transportLayer.post<T>(this.api, payload as Partial<T>);

    await this.fetchData();

    return response;
  };

  patch = async (payload: PatchPayload<T>) => {
    const response = await this.transportLayer.patch<T>(this.api, payload as Partial<T>);

    await this.fetchData();

    return response;
  };

  private fetchData() {
    return this.transportLayer.get<T[]>(this.api).then(this.onFetchData);
  }

  private onFetchData = (response: T[]) => {
    this.setState({ loading: false, response });
  };
}
