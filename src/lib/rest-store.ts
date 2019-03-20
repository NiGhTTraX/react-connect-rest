import { IStateContainer, StateContainer } from 'react-connect-state';
// eslint-disable-next-line no-unused-vars
import HttpRestClient, { PostPayload, RestData } from './http-rest-client';

type ExpandedEntity<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? U extends { id: any } ? IRestStore<U[]> : never
    : T[P] extends { id: any } ? IRestStore<T[P]> : T[P];
};

export type RestStoreResponse<T> = T extends Array<infer U>
  ? U extends { id: any } ? ExpandedEntity<U>[] : never
  : T extends { id: any } ? ExpandedEntity<T> : never;

export type RestStoreState<T> = {
  loading: boolean;
  response?: RestStoreResponse<T>;
};

export interface IRestStore<T> extends IStateContainer<RestStoreState<T>> {
  post: (payload: PostPayload<T>) => Promise<void>;
}

// eslint-disable-next-line max-len
export default class RestStore<T> extends StateContainer<RestStoreState<T>> implements IRestStore<T> {
  private readonly restClient: HttpRestClient;

  private readonly api: string;

  constructor(api: string, restClient: HttpRestClient) {
    super();
    this.api = api;
    this.restClient = restClient;

    this.state = {
      loading: true
    };

    this.fetchData();
  }

  post = async (payload: PostPayload<T>) => {
    await this.restClient.post<T>(
      this.api,
      // @ts-ignore
      payload
    );

    await this.fetchData();
  };

  private async fetchData() {
    const response = await this.restClient.get<T>(this.api);

    let expandedResponse;

    if (Array.isArray(response.data)) {
      expandedResponse = await Promise.all(response.data.map(this.expandLinks));
    } else {
      // @ts-ignore
      expandedResponse = await this.expandLinks(response.data);
    }

    this.setState({
      loading: false,
      // @ts-ignore
      response: expandedResponse
    });
  }

  private expandLinks = async (entity: RestData<T>): Promise<ExpandedEntity<T>> => {
    const stores: Record<string, RestStore<any>> = entity.__links.reduce((acc, link) => ({
      ...acc,
      [link.rel]: new RestStore(
        link.href,
        this.restClient
      )
    }), {});

    // Wait for all the stores to finish loading.
    await Promise.all(
      Object.values(stores).map(store => new Promise(resolve => {
        // Fetching data is asynchronous (and so is pushing notifications)
        // so it should be guaranteed that the loading flag will toggle
        // in the next tick at the earliest meaning that we don't need
        // to check if it has toggled right after store creation.
        store.subscribe(state => {
          if (!state.loading) {
            resolve();
          }
        });
      }))
    );

    const result = {
      ...entity,
      ...stores
    };

    delete result.__links;

    // @ts-ignore
    return result;
  };
}
