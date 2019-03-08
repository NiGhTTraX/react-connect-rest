import { StateContainer } from 'react-connect-state';
import { stub } from 'sinon';
import { Omit } from 'react-bind-component';
import { IRestStore, PatchPayload, RestState } from './rest-store';

// eslint-disable-next-line max-len
export default class RestStoreMock<T extends { id: any }> extends StateContainer<RestState<T>> implements IRestStore<T> {
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
    (payload: PatchPayload<T>): Promise<T>;

    withArgs: (payload: PatchPayload<T>) => {
      returns: (response: T) => void;
    }
  };
}
