/* eslint-disable no-unused-vars */
import { IRestCollectionStore, IRestEntityStore } from './rest';
import { StateContainer } from 'react-connect-state';
import StorageClient from './storage-client';

type RelationalEntity<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? U extends { id: any } ? IRestCollectionStore<U> : never
    : T[P] extends { id: any } ? IRestEntityStore<T[P]> : never;
};

type GetEntity<T> = T extends Array<infer U> ? U : T;

type ToManyRelations<T, U = GetEntity<T>> = {
  [P in keyof U]: U[P] extends Array<any> ? P : never
}[keyof U];

type ToSingleRelations<T, U = GetEntity<T>> = {
  [P in keyof U]: U[P] extends { id: any } ? P : never
}[keyof U];

export type HATEOASLink<T> = {
  href: string;
  rel: ToManyRelations<T> | ToSingleRelations<T>;
};

type RestData<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    // Transform to many relations into lists of IDs
    ? U extends { id: infer X } ? X[] : never
    : T[P] extends { id: infer Y }
      // and to single relations into IDs
      ? Y
      // and leave everything else untouched.
      : T[P];
};

export type HATEOASRestResponse<T> = {
  links: HATEOASLink<T>[];
  data: T extends Array<infer U> ? RestData<U>[] : RestData<T>;
};

type RelationalStoreState<T> = {
  loading: boolean;
  response?: T extends Array<infer U>
    ? U extends { id: any } ? RelationalEntity<U>[] : never
    : T extends { id: any } ? RelationalEntity<T> : never;
};

// eslint-disable-next-line max-len
export default class RelationalStore<T> extends StateContainer<RelationalStoreState<T>> {
  private readonly transportLayer: StorageClient;

  private readonly api: string;

  constructor(api: string, transportLayer: StorageClient) {
    super();
    this.api = api;
    this.transportLayer = transportLayer;

    this.state = {
      loading: true
    };

    this.fetchData();
  }

  private async fetchData() {
    const response = await this.transportLayer.get<HATEOASRestResponse<T>>(this.api);

    let transformedResponse;

    const transformEntity = this.transformEntity(response.links);

    if (Array.isArray(response.data)) {
      transformedResponse = response.data.map(transformEntity);
    } else {
      // @ts-ignore
      transformedResponse = transformEntity(response.data);
    }

    this.setState({
      loading: false,
      // @ts-ignore
      response: transformedResponse
    });
  }

  private transformEntity(links: HATEOASLink<T>[]) {
    return (entity: RestData<T>): RelationalEntity<T> => {
      const stores = links.reduce((acc, link) => ({
        ...acc,
        [link.rel]: new RelationalStore(
          link.href,
          this.transportLayer
        )
      }), {});


      // @ts-ignore
      return {
        ...entity,
        ...stores
      };
    };
  }
}
