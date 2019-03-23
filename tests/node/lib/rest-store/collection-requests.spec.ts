import { describe, expect, it } from '../../suite';
import { It, Mock, Times } from 'typemoq';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
import RestStore from '../../../../src/lib/rest-store';
import { Author } from './fixture';

describe('RestStore', () => {
  describe('collection requests', () => {
    it('should make a GET request when created', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => new Promise(() => {}))
        .verifiable(Times.once());

      // eslint-disable-next-line no-new
      new RestStore<Author[]>(':api:', restClient.object);

      restClient.verifyAll();
    });

    it('should have an initial state', () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author[]>(It.isAny()))
        .returns(() => new Promise(() => {}))
        .verifiable();

      const store = new RestStore<Author[]>(':irrelevant:', restClient.object);

      expect(store.state.loading).to.be.true;
      expect(store.state.response).to.be.undefined;
    });

    it('should store the GET response', async () => {
      const response: RestResponse<Author[]> = {
        data: [
          { __links: [], id: 1, name: 'bar' },
          { __links: [], id: 2, name: 'baz' }
        ]
      };

      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => Promise.resolve(response))
        .verifiable();

      const store = new RestStore<Author[]>(':api:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal([
        { id: 1, name: 'bar' },
        { id: 2, name: 'baz' }
      ]);

      restClient.verifyAll();
    });

    it('should make a POST request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => Promise.resolve({ data: [] }));

      const store = new RestStore<Author[]>(':api:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      const getResponse: RestResponse<Author[]> = {
        data: [
          { __links: [], id: 1, name: 'bar' }
        ]
      };

      restClient
        .setup(x => x.post<Author[]>(':api:', { name: 'bar' }))
        .returns(() => Promise.resolve({ data: { __links: [], id: 1, name: 'bar' } }))
        .verifiable();

      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => Promise.resolve(getResponse));

      await store.post({ name: 'bar' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal([{ id: 1, name: 'bar' }]);

      restClient.verifyAll();
    });

    it('should make a PATCH request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => Promise.resolve({
          data: [
            { __links: [], id: 1, name: 'bar' }
          ]
        }));

      const store = new RestStore<Author[]>(':api:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.patch<Author[]>(':api:', { id: 1, name: 'baz' }))
        .returns(() => Promise.resolve({ data: { __links: [], id: 1, name: 'baz' } }))
        .verifiable();

      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => Promise.resolve({
          data: [{
            __links: [], id: 1, name: 'baz'
          }]
        }));

      await store.patch({ id: 1, name: 'baz' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal([{ id: 1, name: 'baz' }]);

      restClient.verifyAll();
    });

    it('should make a DELETE request', async () => {
      const restClient = Mock.ofType<HttpRestClient>();
      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => Promise.resolve({
          data: [
            { __links: [], id: 1, name: 'bar' }
          ]
        }));

      const store = new RestStore<Author[]>(':api:', restClient.object);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .setup(x => x.delete<Author[]>(':api:', { id: 1 }))
        .returns(() => Promise.resolve())
        .verifiable();

      restClient
        .setup(x => x.get<Author[]>(':api:'))
        .returns(() => Promise.resolve({
          data: []
        }));

      await store.delete({ id: 1 });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal([]);

      restClient.verifyAll();
    });
  });
});
