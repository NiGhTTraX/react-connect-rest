import Mock, { It } from 'strong-mock';
import { expect } from 'tdd-buffet/expect/chai';
import { describe, it } from 'tdd-buffet/suite/node';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
import RestStore from '../../../../src/lib/rest-store';
import { Author } from './fixture';

describe('RestStore', () => {
  describe('entity requests', () => {
    it('should make a GET request when created', () => {
      const restClient = new Mock<HttpRestClient>();
      restClient
        .when(x => x.get<Author>(':api/1:'))
        .returns(new Promise(() => {}))
        .times(1);

      // eslint-disable-next-line no-new
      new RestStore<Author>(':api/1:', restClient.stub);

      restClient.verifyAll();
    });

    it('should have an initial state', () => {
      const restClient = new Mock<HttpRestClient>();
      restClient
        .when(x => x.get<Author>(It.isAny))
        .returns(new Promise(() => {}));

      const store = new RestStore<Author>(':irrelevant:', restClient.stub);

      expect(store.state.loading).to.be.true;
      expect(store.state.response).to.be.undefined;
    });

    it('should store the GET response', async () => {
      const response: RestResponse<Author> = {
        data: { __links: [], id: 1, name: 'bar' }
      };

      const restClient = new Mock<HttpRestClient>();
      restClient
        .when(x => x.get<Author>(':api/1:'))
        .resolves(response);

      const store = new RestStore<Author>(':api/1:', restClient.stub);
      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal(
        { id: 1, name: 'bar' }
      );

      restClient.verifyAll();
    });

    it('should make a POST request', async () => {
      const restClient = new Mock<HttpRestClient>();
      restClient
        .when(x => x.get<Author>(':api/1:'))
        .resolves({
          data: {
            __links: [],
            id: 1,
            name: 'bar'
          }
        });
      // Don't allow a 2nd fetch.

      const store = new RestStore<Author>(':api/1:', restClient.stub);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .when(x => x.post<Author>(':api/1:', { name: 'baz' }))
        .resolves({
          data: {
            __links: [],
            id: 2,
            name: 'baz'
          }
        });

      await store.post({ name: 'baz' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal({ id: 1, name: 'bar' });

      restClient.verifyAll();
    });

    it('should make a PATCH request', async () => {
      const restClient = new Mock<HttpRestClient>();
      restClient
        .when(x => x.get<Author>(':api/1:'))
        .resolves({
          data: {
            __links: [],
            id: 1,
            name: 'bar'
          }
        });

      const store = new RestStore<Author>(':api/1:', restClient.stub);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .when(x => x.patch<Author>(':api/1:', { name: 'baz' }))
        .resolves({
          data: {
            __links: [],
            id: 1,
            name: 'baz'
          }
        });

      restClient
        .when(x => x.get<Author>(':api/1:'))
        .resolves({
          data: {
            __links: [],
            id: 1,
            name: 'baz'
          }
        });

      await store.patch({ name: 'baz' });

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.deep.equal({ id: 1, name: 'baz' });

      restClient.verifyAll();
    });

    it('should make a DELETE request', async () => {
      const restClient = new Mock<HttpRestClient>();
      restClient
        .when(x => x.get<Author>(':api/1:'))
        .resolves({
          data: {
            __links: [],
            id: 1,
            name: 'bar'
          }
        });

      const store = new RestStore<Author>(':api/1:', restClient.stub);
      await new Promise(resolve => store.subscribe(resolve));

      restClient
        .when(x => x.delete<Author>(':api/1:'))
        .resolves(undefined);

      await store.delete();

      expect(store.state.loading).to.be.false;
      expect(store.state.response).to.be.undefined;

      restClient.verifyAll();
    });
  });
});
