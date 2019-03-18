/* eslint-disable no-unused-vars */
import { IRestCollectionStore } from './rest';
import { StateContainer } from 'react-connect-state';
import StorageClient from './storage-client';

type RelationalEntity<T extends { id: any }> = {
  [P in keyof T]: T[P] extends Array<infer U>
    // @ts-ignore
    ? IRestCollectionStore<U>
    : T[P];
};

type GetEntity<T> = T extends Array<infer U> ? U : T;

type ToManyRelations<T, U = GetEntity<T>> = {
  [P in keyof U]: U[P] extends Array<any> ? P : never
}[keyof U];

export type HATEOASLink<T> = {
  href: string;
  rel: ToManyRelations<T>;
};

type RestData<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? U extends { id: infer X }
      ? X[]
      : never
    : T[P];
};

export type HATEOASRest<T> = {
  links: HATEOASLink<T>[];
  data: T extends Array<infer U>
    ? RestData<U>[]
    : RestData<T>;
};

type RelationalCollectionStoreState<T extends { id: any }> = {
  loading: boolean;
  response: RelationalEntity<T>[];
};

// eslint-disable-next-line max-len
export default class RelationalStore<T extends { id: any }> extends StateContainer<RelationalCollectionStoreState<T>> {
  private readonly transportLayer: StorageClient;

  private readonly api: string;

  constructor(api: string, transportLayer: StorageClient) {
    super();
    this.api = api;
    this.transportLayer = transportLayer;

    this.state = {
      loading: true,
      response: []
    };

    this.fetchData();
  }

  private async fetchData() {
    const response = await this.transportLayer.get<HATEOASRest<T[]>>(this.api);

    const toManyLinks = response.links.filter(
      link => Array.isArray(response.data[0][link.rel])
    );

    // @ts-ignore
    const transformedResponse: RelationalEntity<T>[] = response.data.map(entity => {
      const restCollectionStores = toManyLinks.reduce((acc, link) => ({
        ...acc,
        [link.rel]: new RelationalStore(
          link.href,
          this.transportLayer
        )
      }), {});

      return {
        ...entity,
        ...restCollectionStores
      };
    });

    this.setState({ loading: false, response: transformedResponse });
  }
}
