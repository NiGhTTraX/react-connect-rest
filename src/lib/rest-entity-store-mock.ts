import { StateContainer } from 'react-connect-state';
import { stub } from 'sinon';
import { Omit } from 'react-bind-component';
import {
  IRestEntityStore,
  RestEntityState
} from './rest';

// eslint-disable-next-line max-len
export default class RestEntityStoreMock<T extends { id: any }> extends StateContainer<RestEntityState<T>> implements IRestEntityStore<T> {
  constructor(mock?: T) {
    super();

    // @ts-ignore
    this.state = mock ? {
      loading: false,
      response: mock
    } : {
      loading: true,
      response: null
    };
  }

  patch = stub() as {
    (payload: Partial<Omit<T, 'id'>>): Promise<T>;

    withArgs: (payload: Partial<Omit<T, 'id'>>) => {
      returns: (response: Promise<T>) => void;
    }
  };
}
