import { describe, expect, it } from '../../suite';
import { It, Mock, Times } from 'typemoq';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
import RestStore from '../../../../src/lib/rest-store';

describe('RestStore', () => {
  describe('collection requests', () => {
    interface Foo {
      id: number;
      foo: string;
    }

    it('should make a GET request when created', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo[]>(':api:'))
        .returns(() => new Promise(() => {}))
        .verifiable(Times.once());

      // eslint-disable-next-line no-new
      new RestStore<Foo[]>(':api:', restClient.object);

      restClient.verifyAll();
    });

    it('should have an initial state', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo[]>(It.isAny()))
        .returns(() => new Promise(() => {}))
        .verifiable();

      const store = new RestStore<Foo[]>(':irrelevant:', restClient.object);

      expect(store.state.loading).to.be.true;
      expect(store.state.response).to.be.undefined;
    });

    it('should store the GET response', async () => {
      const response: RestResponse<Foo[]> = {
        data: [
          { __links: [], id: 1, foo: 'bar' },
          { __links: [], id: 2, foo: 'baz' }
        ]
      };

      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo[]>(':api:'))
        .returns(() => Promise.resolve(response))
        .verifiable();

      const store = new RestStore<Foo[]>(':api:', restClient.object);

      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal([
        { id: 1, foo: 'bar' },
        { id: 2, foo: 'baz' }
      ]);

      restClient.verifyAll();
    });

    it('should make a POST request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo[]>(':api:'))
        .returns(() => Promise.resolve({ data: [] }));

      const store = new RestStore<Foo[]>(':api:', restClient.object);

      const getResponse: RestResponse<Foo[]> = {
        data: [
          { __links: [], id: 1, foo: 'bar' }
        ]
      };

      restClient
        .setup(x => x.post<Foo[]>(':api:', { foo: 'bar' }))
        .returns(() => Promise.resolve({ data: { __links: [], id: 1, foo: 'bar' } }))
        .verifiable();

      restClient
        .setup(x => x.get<Foo[]>(':api:'))
        .returns(() => Promise.resolve(getResponse));

      await store.post({ foo: 'bar' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal([{ id: 1, foo: 'bar' }]);

      restClient.verifyAll();
    });
  });
});
