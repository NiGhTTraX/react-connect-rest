import { RestStore } from './rest-store';
import { EntityPatchPayload, IRestEntityStore } from './rest';
import StorageClient from './storage-client';
import FetchClient from './fetch-client';

// eslint-disable-next-line max-len
export default class RestEntityStore<T extends { id: any }> extends RestStore<T, T> implements IRestEntityStore<T> {
  constructor(api: string, transportLayer: StorageClient = FetchClient) {
    super(
      api,
      // @ts-ignore TODO: what should the initial response be?
      {},
      transportLayer
    );
  }

  patch = async (payload: EntityPatchPayload<T>) => {
    const response = await this.transportLayer.update<T>(
      this.api,
      // @ts-ignore TODO: figure this out
      payload
    );

    await this.fetchData();

    return response;
  }
}