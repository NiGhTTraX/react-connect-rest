import { describe, expect, it } from '../../suite';
import { It, Mock, Times } from 'typemoq';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
import RestStore from '../../../../src/lib/rest-store';

describe('RestStore', () => {
  describe('entity requests', () => {
    interface Foo {
      id: number;
      foo: string;
    }

    it('should make a GET request when created', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo>(':api/1:'))
        .returns(() => new Promise(() => {}))
        .verifiable(Times.once());

      // eslint-disable-next-line no-new
      new RestStore<Foo>(':api/1:', restClient.object);

      restClient.verifyAll();
    });

    it('should have an initial state', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo>(It.isAny()))
        .returns(() => new Promise(() => {}))
        .verifiable();

      const store = new RestStore<Foo>(':irrelevant:', restClient.object);

      expect(store.state.loading).to.be.true;
      expect(store.state.response).to.be.undefined;
    });

    it('should store the GET response', async () => {
      const response: RestResponse<Foo> = {
        data: { __links: [], id: 1, foo: 'bar' }
      };

      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo>(':api/1:'))
        .returns(() => Promise.resolve(response))
        .verifiable();

      const store = new RestStore<Foo>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal(
        { id: 1, foo: 'bar' }
      );

      restClient.verifyAll();
    });

    it('should make a POST request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, foo: 'bar' }
        }))
        // Don't allow a 2nd fetch.
        .verifiable();

      const store = new RestStore<Foo>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.post<Foo>(':api/1:', { foo: 'baz' }))
        .returns(() => Promise.resolve({ data: { __links: [], id: 2, foo: 'baz' } }))
        .verifiable();

      await store.post({ foo: 'baz' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal({ id: 1, foo: 'bar' });

      restClient.verifyAll();
    });

    it('should make a PATCH request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, foo: 'bar' }
        }));

      const store = new RestStore<Foo>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.patch<Foo>(':api/1:', { foo: 'baz' }))
        .returns(() => Promise.resolve({ data: { __links: [], id: 1, foo: 'baz' } }))
        .verifiable();

      restClient
        .setup(x => x.get<Foo>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, foo: 'baz' }
        }));

      await store.patch({ foo: 'baz' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal({ id: 1, foo: 'baz' });

      restClient.verifyAll();
    });

    it('should make a DELETE request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Foo>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, foo: 'bar' }
        }));

      const store = new RestStore<Foo>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.delete<Foo>(':api/1:'))
        .returns(() => Promise.resolve())
        .verifiable();

      await store.delete();

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.be.undefined;

      restClient.verifyAll();
    });
  });
});
