/* eslint-disable no-unused-vars */
import { IRestCollectionStore } from './rest';
import { StateContainer } from 'react-connect-state';
import StorageClient from './storage-client';

export type ManyToMany<T extends { id: any }> = T['id'][] & { __fk?: 'm2m' };

type RelationalEntity<T extends { id: any }> = {
  [P in keyof T]: T[P] extends ManyToMany<infer U>
    // @ts-ignore
    ? IRestCollectionStore<U>
    : T[P];
};

type GetEntity<T> = T extends Array<infer U> ? U : T;

type Relations<T, U = GetEntity<T>> = {
  [P in keyof U]: U[P] extends ManyToMany<any> ? P : never
}[keyof U];

export type HATEOASLink<T> = {
  type: 'm2m';
  href: string;
  rel: Relations<T>;
};

export type HATEOASRest<T> = {
  links: HATEOASLink<T>[];
  data: T;
};

function isManyToMany<T>(
  response: HATEOASRest<T>,
  key: Relations<T>
): boolean {
  return !!response.links.find(
    link => link.rel === key && link.type === 'm2m'
  );
}

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

    // @ts-ignore
    const transformedResponse: RelationalEntity<T>[] = response.data.map(e => {
      const manyToManyKeys = Object.keys(e).filter(
        // @ts-ignore
        key => isManyToMany(response, key)
      );

      const restCollectionStores = manyToManyKeys.reduce((acc, key) => ({
        ...acc,
        [key]: new RelationalStore(
          this.getLink(response, key as Relations<T>),
          this.transportLayer
        )
      }), {});
      return {
        ...e,
        ...restCollectionStores
      };
    });

    this.setState({ loading: false, response: transformedResponse });
  }

  private getLink = (e: HATEOASRest<T[]>, rel: Relations<T>): string => {
    const link = e.links.find(l => l.rel === rel);

    if (!link) {
      throw new Error(`Link ${rel} not found`);
    }

    return link.href;
  };
}
