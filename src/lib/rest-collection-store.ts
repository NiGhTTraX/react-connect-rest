import { Omit } from 'react-bind-component';
import HttpClient from './http-client';
import FetchClient from './fetch-client';
import { IRestCollectionStore } from './rest';
import { BaseRestStore } from './base-rest-store';

/**
 * Fetch and offer methods to mutate a REST collection.
 */
// eslint-disable-next-line max-len
export default class RestCollectionStore<T extends { id: any }> extends BaseRestStore<T, T[]> implements IRestCollectionStore<T> {
  constructor(api: string, transportLayer: HttpClient = FetchClient) {
    super(api, [], transportLayer);
  }

  post = async (payload: Partial<Omit<T, 'id'>>) => {
    const response = await this.transportLayer.post<T>(this.api, payload as Partial<T>);

    await this.fetchData();

    return response;
  };

  delete = async (payload: Pick<T, 'id'>) => {
    await this.transportLayer.delete(this.api, payload);
    await this.fetchData();
    return Promise.resolve(this.state.response);
  };
}
