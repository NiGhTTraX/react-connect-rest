import { IStateContainer } from 'react-connect-state';
import { Omit } from 'react-bind-component';

export interface RestCollectionState<T> {
  loading: boolean;
  response: T[]
}

// eslint-disable-next-line max-len
export interface IRestCollectionStore<T extends { id: any }> extends IStateContainer<RestCollectionState<T>> {
  state: RestCollectionState<T>;

  /**
   * Create a new entity via a POST request.
   */
  post: (payload: Partial<Omit<T, 'id'>>) => Promise<T>;

  /**
   * Delete a specific entity via a DELETE request.
   */
  delete: (payload: Pick<T, 'id'>) => Promise<T[]>;
}

export interface RestEntityState<T> {
  loading: boolean;
  response: T;
}

export type EntityPatchPayload<T extends { id: any }> = Partial<Omit<T, 'id'>>;

// eslint-disable-next-line max-len
export interface IRestEntityStore<T extends { id: any }> extends IStateContainer<RestEntityState<T>> {
  /**
   * Update this entity via a PATCH request.
   */
  patch: (payload: EntityPatchPayload<T>) => Promise<T>;
}
