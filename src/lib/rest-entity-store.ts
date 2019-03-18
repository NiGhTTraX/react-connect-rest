import { BaseRestStore } from './base-rest-store';
import { EntityPatchPayload, IRestEntityStore } from './rest';
import HttpClient from './http-client';
import FetchClient from './fetch-client';

// eslint-disable-next-line max-len
export default class RestEntityStore<T extends { id: any }> extends BaseRestStore<T, T> implements IRestEntityStore<T> {
  constructor(api: string, transportLayer: HttpClient = FetchClient) {
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
