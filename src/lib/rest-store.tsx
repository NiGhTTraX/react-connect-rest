import { StateContainer } from 'react-state-connect';
import TransportLayer from './transport-layer';
import FetchTransport from './fetch-transport';
// eslint-disable-next-line no-unused-vars
import { stub } from 'sinon';

export interface RestState<T> {
  loading: boolean;

  /**
   * The endpoint is assumed to return a collection of entities.
   */
  response: T[]
}

export interface IRestStore<T> extends StateContainer<RestState<T>> {
  state: RestState<T>;

  /**
   * Create a new entity via a POST request.
   */
  post: (payload: Partial<T>) => void; // TODO: return T
}

export default class RestStore<T> extends StateContainer<RestState<T>> implements IRestStore<T> {
  private readonly api: string;

  private readonly transportLayer: TransportLayer = FetchTransport;

  constructor(api: string, transportLayer: TransportLayer = FetchTransport) {
    super();

    this.transportLayer = transportLayer;
    this.api = api;

    this.state = {
      loading: true,
      response: []
    };

    transportLayer.get<T[]>(api).then(this.onFetchData);
  }

  private onFetchData = (response: T[]) => {
    this.setState({ loading: false, response });
  };

  post = async (payload: Partial<T>) => {
    await this.transportLayer.post<T>(this.api, payload);

    return this.transportLayer.get<T[]>(this.api).then(this.onFetchData);
  };
}

export class RestStoreMock<T> extends StateContainer<RestState<T>> implements IRestStore<T> {
  constructor(mock?: T[]) {
    super();

    this.state = mock ? { loading: false, response: mock } : { loading: true, response: [] };
  }

  post = stub() as (payload: Partial<T>) => void;
}
