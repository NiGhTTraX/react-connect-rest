import { StateContainer } from 'react-connect-state';
import { Omit } from 'react-bind-component';

export type CollectionPatchPayload<T extends { id: any }> = Pick<T, 'id'> & Partial<Omit<T, 'id'>>;

export type EntityPatchPayload<T extends { id: any }> = Partial<Omit<T, 'id'>>;

export interface RestCollectionState<T> {
  loading: boolean;
  response: T[]
}

// eslint-disable-next-line max-len
export interface IRestCollectionStore<T extends { id: any }> extends StateContainer<RestCollectionState<T>> {
  state: RestCollectionState<T>;

  /**
   * Create a new entity via a POST request.
   */
  post: (payload: Partial<Omit<T, 'id'>>) => Promise<T>;

  delete: (payload: Pick<T, 'id'>) => Promise<T[]>;
}

export interface RestEntityState<T> {
  loading: boolean;
  response: T;
}

// eslint-disable-next-line max-len
export interface IRestEntityStore<T extends { id: any }> extends StateContainer<RestEntityState<T>> {
  /**
   * Update this entity via a PATCH request.
   */
  patch: (payload: EntityPatchPayload<T>) => Promise<T>;
}
