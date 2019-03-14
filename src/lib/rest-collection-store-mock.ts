import { StateContainer } from 'react-connect-state';
import { stub } from 'sinon';
import { Omit } from 'react-bind-component';
import { IRestCollectionStore, CollectionPatchPayload, RestCollectionState } from './rest';

// eslint-disable-next-line max-len
export default class RestCollectionStoreMock<T extends { id: any }> extends StateContainer<RestCollectionState<T>> implements IRestCollectionStore<T> {
  constructor(mock?: T[]) {
    super();

    this.state = mock ? {
      loading: false,
      response: mock
    } : {
      loading: true,
      response: []
    };
  }

  post = stub() as {
    (payload: Partial<Omit<T, 'id'>>): Promise<T>;

    withArgs: (payload: Partial<Omit<T, 'id'>>) => {
      returns: (response: T) => void;
    }
  };

  patch = stub() as {
    (payload: CollectionPatchPayload<T>): Promise<T>;

    withArgs: (payload: CollectionPatchPayload<T>) => {
      returns: (response: T) => void;
    }
  };
}
