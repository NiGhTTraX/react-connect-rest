import { StateContainer } from 'react-connect-state';
import { spy } from 'sinon';
import {
  IRestStore,
  RestStoreResponse,
  RestStoreState,
  PostPayload
} from './rest-store';

// eslint-disable-next-line max-len
export default class RestStoreMock<T> extends StateContainer<RestStoreState<T>> implements IRestStore<T> {
  constructor(mock?: RestStoreResponse<T>) {
    super();

    this.state = typeof mock === 'undefined'
      ? { loading: true }
      : { loading: false, response: mock };
  }

  post = spy() as {
    (payload: PostPayload<T>): Promise<void>;

    calledWith: (payload: PostPayload<T>) => boolean;
  };
}
