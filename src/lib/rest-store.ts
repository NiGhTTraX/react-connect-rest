import { StateContainer } from 'react-state-connect';
import TransportLayer from './transport-layer';
import FetchTransport from './fetch-transport';
// eslint-disable-next-line no-unused-vars
import { Omit } from 'react-bind-component';

export interface RestState<T> {
  loading: boolean;

  /**
   * The endpoint is assumed to return a collection of entities.
   */
  response: T[]
}

export type PatchPayload<T extends { id: any }> = Pick<T, 'id'> & Partial<Omit<T, 'id'>>;

export interface IRestStore<T extends { id: any }> extends StateContainer<RestState<T>> {
  state: RestState<T>;

  /**
   * Create a new entity via a POST request.
   */
  post: (payload: Partial<Omit<T, 'id'>>) => Promise<T>;

  /**
   * Update an existing entity via a POST request.
   */
  patch: (payload: PatchPayload<T>) => Promise<T>;
}

// eslint-disable-next-line max-len
export default class RestStore<T extends { id: any }> extends StateContainer<RestState<T>> implements IRestStore<T> {
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
