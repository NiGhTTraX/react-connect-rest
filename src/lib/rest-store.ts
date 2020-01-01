/* eslint-disable no-underscore-dangle */
import { IStateContainer, StateContainer } from 'react-connect-state';
// eslint-disable-next-line no-unused-vars
import HttpRestClient, {
  DeletePayload, HATEOASLink,
  PatchPayload,
  PostPayload,
  RestData, RestResponse
} from './http-rest-client';

export type StoreModel<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? U extends { id: any } ? IRestStore<U[]> : U[]
    : T[P] extends { id: any } ? IRestStore<T[P]> : T[P];
};

export type RestStoreResponse<T> = T extends Array<infer U>
  ? U extends { id: any } ? StoreModel<U>[] : never
  : T extends { id: any } ? StoreModel<T> : never;

export type RestStoreState<T> = {
  loading: true
  // TODO: loading can also mean refreshing so an existing response _might_ be present
  response?: RestStoreResponse<T>;
} | {
  loading: false;
  response: RestStoreResponse<T>;
};

export interface IRestStore<T> extends IStateContainer<RestStoreState<T>> {
  post(payload: PostPayload<T>): Promise<void>;

  patch(payload: PatchPayload<T>): Promise<void>;

  delete(payload: DeletePayload<T>): Promise<void>;
  delete(): Promise<void>;
}

// eslint-disable-next-line max-len
export default class RestStore<T> extends StateContainer<RestStoreState<T>> implements IRestStore<T> {
  private readonly restClient: HttpRestClient;

  private readonly api: string;

  constructor(api: string, restClient: HttpRestClient, existingResponse?: RestResponse<T>['data']) {
    super();
    this.api = api;
    this.restClient = restClient;

    this.state = {
      loading: true
    };

    if (existingResponse) {
      // Best case the response is expanded synchronously but we can't
      // know that so we always await it.
      this.expandResponse({ data: existingResponse }).then(expandedResponse => {
        this.setState({
          loading: false,
          response: expandedResponse
        });
      });
    } else {
      this.fetchData();
    }
  }

  post = async (payload: PostPayload<T>) => {
    await this.restClient.post<T>(this.api, payload);

    // TODO: should we allow POSTs on entities?
    if (Array.isArray(this.state.response)) {
      await this.fetchData();
    }
  };

  patch = async (payload: PatchPayload<T>) => {
    await this.restClient.patch<T>(this.api, payload);

    await this.fetchData();
  };

  delete = async (payload?: DeletePayload<T>) => {
    if (typeof payload !== 'undefined') {
      await this.restClient.delete<T>(this.api, payload);

      await this.fetchData();
    } else {
      await this.restClient.delete<T>(this.api);

      // TODO: the store is basically invalid now; should we allow DELETEs
      // on entities?
      this.setState({
        response: undefined
      });
    }
  };

  private async fetchData() {
    const response = await this.restClient.get<T>(this.api);
    const expandedResponse = await this.expandResponse(response);

    this.setState({
      loading: false,
      // @ts-ignore
      response: expandedResponse
    });
  }

  private async expandResponse(response: RestResponse<T>): Promise<RestStoreResponse<T>> {
    let expandedResponse;

    if (Array.isArray(response.data)) {
      expandedResponse = await Promise.all(response.data.map(this.expandLinks));
    } else {
      // @ts-ignore
      expandedResponse = await this.expandLinks(response.data);
    }

    return expandedResponse;
  }

  private expandLinks = async (entity: RestData<T>): Promise<StoreModel<T>> => {
    const linksToExpand = Object.entries(entity.__links)
      .filter(([link]) => !this.isLinkExpanded(
        entity,
        // @ts-ignore
        link
      ));

    const expandedLinks = Object.entries(entity.__links)
      .filter(([link]) => this.isLinkExpanded(
        entity,
        // @ts-ignore
        link
      ));

    const stores: Record<string, RestStore<any>> = linksToExpand
      .reduce((acc, [rel, href]) => ({
        ...acc,
        [rel]: new RestStore(
          // @ts-ignore
          href,
          this.restClient
        )
      }), {});

    const expandedStores: Record<string, RestStore<any>> = expandedLinks
      .reduce((acc, [rel, href]) => ({
        ...acc,
        [rel]: new RestStore(
          // @ts-ignore
          href,
          this.restClient,
          // @ts-ignore
          entity[rel]
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
          // TODO: we don't have a test for the else branch
          /* istanbul ignore else */
          if (!state.loading) {
            resolve();
          }
        });
      }))
    );

    const result = {
      ...entity,
      ...stores,
      ...expandedStores
    };

    delete result.__links;

    // @ts-ignore
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  private isLinkExpanded(entity: RestData<T>, link: HATEOASLink<T>) {
    // @ts-ignore
    const value = entity[link];

    return Array.isArray(value)
      ? value.length && typeof value[0] === 'object'
      : typeof value === 'object';
  }
}
