import { StateContainer } from 'react-connect-state';
import { stub } from 'sinon';
import { IRestStore, RestStoreResponse, RestStoreState } from './rest-store';
import { PostPayload } from './http-rest-client';

// eslint-disable-next-line max-len
export default class RestStoreMock<T> extends StateContainer<RestStoreState<T>> implements IRestStore<T> {
  constructor(mock?: RestStoreResponse<T>) {
    super();

    this.state = typeof mock === 'undefined'
      ? { loading: true }
      : { loading: false, response: mock };
  }

  post = stub() as {
    (payload: PostPayload<T>): Promise<void>;

    withArgs: (payload: PostPayload<T>) => {
      returns: (response: Promise<void>) => void;
    }
  };
}
