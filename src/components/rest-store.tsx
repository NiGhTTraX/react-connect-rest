import { StateContainer } from 'react-state-connect';
import TransportLayer from '../lib/transport-layer';
import FetchTransport from '../lib/fetch-transport';

export interface RestState<T> {
  loading: boolean;

  /**
   * The endpoint is assumed to return a collection of entities.
   */
  response: T[]
}

export interface IRestStore<T> {
  state: RestState<T>;

  /**
   * Create a new entity via a POST request.
   */
  post: (payload: Partial<T>) => void; // TODO: return T
}

export default class RestStore<T> extends StateContainer<RestState<T>> implements IRestStore<T> {
  constructor(private api: string, private transportLayer: TransportLayer = FetchTransport) {
    super();

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
  }
}
