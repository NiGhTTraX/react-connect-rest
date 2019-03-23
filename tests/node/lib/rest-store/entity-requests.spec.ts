import { describe, expect, it } from '../../suite';
import { It, Mock, Times } from 'typemoq';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
import RestStore from '../../../../src/lib/rest-store';
import { Author } from './fixture';

describe('RestStore', () => {
  describe('entity requests', () => {
    it('should make a GET request when created', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author>(':api/1:'))
        .returns(() => new Promise(() => {}))
        .verifiable(Times.once());

      // eslint-disable-next-line no-new
      new RestStore<Author>(':api/1:', restClient.object);

      restClient.verifyAll();
    });

    it('should have an initial state', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author>(It.isAny()))
        .returns(() => new Promise(() => {}))
        .verifiable();

      const store = new RestStore<Author>(':irrelevant:', restClient.object);

      expect(store.state.loading).to.be.true;
      expect(store.state.response).to.be.undefined;
    });

    it('should store the GET response', async () => {
      const response: RestResponse<Author> = {
        data: { __links: [], id: 1, name: 'bar' }
      };

      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author>(':api/1:'))
        .returns(() => Promise.resolve(response))
        .verifiable();

      const store = new RestStore<Author>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal(
        { id: 1, name: 'bar' }
      );

      restClient.verifyAll();
    });

    it('should make a POST request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, name: 'bar' }
        }))
        // Don't allow a 2nd fetch.
        .verifiable();

      const store = new RestStore<Author>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.post<Author>(':api/1:', { name: 'baz' }))
        .returns(() => Promise.resolve({ data: { __links: [], id: 2, name: 'baz' } }))
        .verifiable();

      await store.post({ name: 'baz' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal({ id: 1, name: 'bar' });

      restClient.verifyAll();
    });

    it('should make a PATCH request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, name: 'bar' }
        }));

      const store = new RestStore<Author>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.patch<Author>(':api/1:', { name: 'baz' }))
        .returns(() => Promise.resolve({ data: { __links: [], id: 1, name: 'baz' } }))
        .verifiable();

      restClient
        .setup(x => x.get<Author>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, name: 'baz' }
        }));

      await store.patch({ name: 'baz' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal({ id: 1, name: 'baz' });

      restClient.verifyAll();
    });

    it('should make a DELETE request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author>(':api/1:'))
        .returns(() => Promise.resolve({
          data: { __links: [], id: 1, name: 'bar' }
        }));

      const store = new RestStore<Author>(':api/1:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.delete<Author>(':api/1:'))
        .returns(() => Promise.resolve())
        .verifiable();

      await store.delete();

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.be.undefined;

      restClient.verifyAll();
    });
  });
});
