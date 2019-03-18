/* eslint-disable no-unused-vars */
import { IRestCollectionStore, IRestEntityStore } from './rest';
import { StateContainer } from 'react-connect-state';
import HttpClient from './http-client';
import { Omit } from 'yargs';

type RelationalEntity<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? U extends { id: any } ? IRestCollectionStore<U> : never
    : T[P] extends { id: any } ? IRestEntityStore<T[P]> : never;
};

type GetEntity<T> = T extends Array<infer U> ? U : T;

type ToManyRelations<T, U = GetEntity<T>> = {
  [P in keyof U]: U[P] extends Array<infer U>
    ? U extends { id: any } ? P : never
    : never
}[keyof U];

type ToSingleRelations<T, U = GetEntity<T>> = {
  [P in keyof U]: U[P] extends { id: any } ? P : never
}[keyof U];

export type HATEOASLink<T> = {
  href: string;
  rel: ToManyRelations<T> | ToSingleRelations<T>;
};

type HATEOASMetadata<T> = {
  __links: HATEOASLink<T>[];
};

type RestData<T> = HATEOASMetadata<T> & {
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
  data: T extends Array<infer U> ? RestData<U>[] : RestData<T>;
};

type RestStoreState<T> = {
  loading: boolean;
  response?: T extends Array<infer U>
    ? U extends { id: any } ? RelationalEntity<U>[] : never
    : T extends { id: any } ? RelationalEntity<T> : never;
};

// eslint-disable-next-line max-len
export default class RestStore<T> extends StateContainer<RestStoreState<T>> {
  private readonly transportLayer: HttpClient;

  private readonly api: string;

  constructor(api: string, transportLayer: HttpClient) {
    super();
    this.api = api;
    this.transportLayer = transportLayer;

    this.state = {
      loading: true
    };

    this.fetchData();
  }

  post = async (payload: Partial<Omit<GetEntity<T>, 'id'>>): Promise<GetEntity<T>> => {
    const reply = await this.transportLayer.post<GetEntity<T>>(
      this.api,
      // @ts-ignore
      payload
    );

    await this.fetchData();

    return reply;
  };

  private async fetchData() {
    const response = await this.transportLayer.get<HATEOASRestResponse<T>>(this.api);

    let expandedResponse;

    if (Array.isArray(response.data)) {
      expandedResponse = response.data.map(this.expandLinks);
    } else {
      // @ts-ignore
      expandedResponse = this.expandLinks(response.data);
    }

    this.setState({
      loading: false,
      // @ts-ignore
      response: expandedResponse
    });
  }

  private expandLinks = (entity: RestData<T>): RelationalEntity<T> => {
    const stores = entity.__links.reduce((acc, link) => ({
      ...acc,
      [link.rel]: new RestStore(
        link.href,
        this.transportLayer
      )
    }), {});

    const result = {
      ...entity,
      ...stores
    };

    delete result.__links;

    // @ts-ignore
    return result;
  };
}
