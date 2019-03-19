import { StateContainer } from 'react-connect-state';
import { Omit } from 'react-bind-component';
import { stub } from 'sinon';
import { IRestStore, RestStoreResponse, RestStoreState, GetEntity } from './rest-store';

// eslint-disable-next-line max-len
export default class RestStoreMock<T> extends StateContainer<RestStoreState<T>> implements IRestStore<T> {
  constructor(mock?: RestStoreResponse<T>) {
    super();

    this.state = typeof mock === 'undefined'
      ? { loading: true }
      : { loading: false, response: mock };
  }

  post = stub() as {
    (payload: Partial<Omit<GetEntity<T>, 'id'>>): Promise<GetEntity<T>>;

    withArgs: (payload: Partial<Omit<GetEntity<T>, 'id'>>) => {
      returns: (response: Promise<GetEntity<T>>) => void;
    }
  };
}
