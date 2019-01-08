import { StateContainer } from 'react-state-connect';
import TransportLayer from '../lib/transport-layer';

interface RestState<T> {
  loading: boolean;
  response: T[]
}

export default class RestStore2<T> extends StateContainer<RestState<T>> {
  constructor(private transportLayer: TransportLayer, private api: string) {
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
