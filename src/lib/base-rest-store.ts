import { StateContainer } from 'react-connect-state';
import StorageClient from './storage-client';
import FetchClient from './fetch-client';

export interface RestState<T> {
  loading: boolean;
  response: T;
}

export class BaseRestStore<
  T extends { id: any },
  R
> extends StateContainer<RestState<R>> {
  protected readonly api: string;

  protected readonly transportLayer: StorageClient;

  constructor(
    api: string,
    initialResponse: R,
    transportLayer: StorageClient = FetchClient
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
