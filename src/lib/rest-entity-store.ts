import { RestStore } from './rest-store';
import { EntityPatchPayload, IRestEntityStore } from './rest';
import TransportLayer from './transport-layer';
import FetchTransport from './fetch-transport';

// eslint-disable-next-line max-len
export default class RestEntityStore<T extends { id: any }> extends RestStore<T, T> implements IRestEntityStore<T> {
  constructor(api: string, transportLayer: TransportLayer = FetchTransport) {
    super(
      api,
      // @ts-ignore TODO: what should the initial response be?
      {},
      transportLayer
    );
  }

  patch = async (payload: EntityPatchPayload<T>) => {
    const response = await this.transportLayer.patch<T>(
      this.api,
      // @ts-ignore TODO: figure this out
      payload
    );

    await this.fetchData();

    return response;
  }
}
