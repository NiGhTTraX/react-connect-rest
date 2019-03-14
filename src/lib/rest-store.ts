import { StateContainer } from 'react-connect-state';
import TransportLayer from './transport-layer';
import FetchTransport from './fetch-transport';

export interface RestState<T> {
  loading: boolean;
  response: T;
}

export class RestStore<
  T extends { id: any },
  R
> extends StateContainer<RestState<R>> {
  protected readonly api: string;

  protected readonly transportLayer: TransportLayer;

  constructor(
    api: string,
    initialResponse: R,
    transportLayer: TransportLayer = FetchTransport
  ) {
    super();

    this.transportLayer = transportLayer;
    this.api = api;

    this.state = {
      loading: true,
      response: initialResponse
    };

    this.fetchData();
  }

  private onFetchData = (response: R) => {
    this.setState({
      loading: false,
      response
    });
  };

  protected fetchData() {
    return this.transportLayer.get<R>(this.api).then(this.onFetchData);
  }
}
