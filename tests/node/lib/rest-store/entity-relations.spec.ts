import { wait } from '@tdd-buffet/react';
import Mock from 'strong-mock';
import { expect } from 'tdd-buffet/expect/chai';
import { describe, it } from 'tdd-buffet/suite/node';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
import RestStore from '../../../../src/lib/rest-store';
import {
  ArrayModel,
  Author,
  authorResponse,
  authorsResponse,
  Book,
  bookResponse,
  Post,
  postResponse
} from './fixture';

describe('RestStore', () => {
  describe('entity relations', () => {
    it('should leave primitives alone', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Author>(':author-api:'))
        .returns(Promise.resolve(authorResponse));

      const authorStore = new RestStore<Author>(':author-api:', restClient.stub);

      await new Promise(resolve => authorStore.subscribe(resolve));

      expect(authorStore.state.response).to.deep.equal({ id: 1, name: 'author 1' });
    });

    it('should leave arrays alone', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<ArrayModel>(':number-api:'))
        .returns(Promise.resolve({ data: { __links: {}, id: 1, numbers: [1, 2, 3] } }));

      const store = new RestStore<ArrayModel>(':number-api:', restClient.stub);

      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.response).to.deep.equal({ id: 1, numbers: [1, 2, 3] });
    });

    it('should transform an expanded to many relations into a prefetched collection store', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Book>(':book-api:'))
        .returns(Promise.resolve({
          data: {
            __links: { authors: ':authors-api:' },
            id: 1,
            authors: [{
              __links: {},
              id: 1,
              name: 'author 1'
            }]
          }
        }));

      const bookStore = new RestStore<Book>(':book-api:', restClient.stub);

      await new Promise(resolve => bookStore.subscribe(resolve));

      // @ts-ignore
      const authorsStore = bookStore.state.response.authors;

      expect(authorsStore.state.response).to.deep.equal([{ id: 1, name: 'author 1' }]);
    });

    it('should transform an expanded to single relations into a prefetched entity store', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Post>(':post-api:'))
        .returns(Promise.resolve({
          data: {
            __links: { author: ':authors-api:' },
            id: 1,
            author: {
              __links: {},
              id: 1,
              name: 'author 1'
            }
          }
        }));

      const postStore = new RestStore<Post>(':post-api:', restClient.stub);

      await new Promise(resolve => postStore.subscribe(resolve));

      // @ts-ignore
      const authorStore = postStore.state.response.author;

      expect(authorStore.state.response).to.deep.equal({ id: 1, name: 'author 1' });
    });

    it('should transform a to many relation into a collection store', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Book>(':book-api:'))
        .returns(Promise.resolve(bookResponse));

      restClient
        .when(x => x.get<Author[]>(':author-api:'))
        .returns(Promise.resolve(authorsResponse));

      const bookStore = new RestStore<Book>(':book-api:', restClient.stub);

      await new Promise(resolve => bookStore.subscribe(resolve));

      // @ts-ignore
      const authorsStore = bookStore.state.response.authors;

      expect(
        authorsStore,
        'The relation was not transformed'
      ).to.not.deep.equal([1]);

      expect(authorsStore.state.response).to.deep.equal([{ id: 1, name: 'author 1' }]);
    });

    it('should transform a to single relation into an entity store', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Post>(':post-api:'))
        .returns(Promise.resolve(postResponse));

      restClient
        .when(x => x.get<Author>(':author-api:'))
        .returns(Promise.resolve(authorResponse));

      const postStore = new RestStore<Post>(':post-api:', restClient.stub);

      await new Promise(resolve => postStore.subscribe(resolve));

      // @ts-ignore
      const authorStore = postStore.state.response.author;

      expect(
        authorStore,
        'The relation was not transformed'
      ).to.not.deep.equal(1);

      expect(authorStore.state.response).to.deep.equal({ id: 1, name: 'author 1' });
    });

    it('should wait for all child stores', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Post>(':post-api:'))
        .returns(Promise.resolve(postResponse))
        .times(1);

      let resolveAuthor: (r: RestResponse<Author>) => void = () => {};

      restClient
        .when(x => x.get<Author>(':author-api:'))
        .returns(new Promise(resolve => { resolveAuthor = resolve; }));

      const postStore = new RestStore<Post>(':post-api:', restClient.stub);

      // Wait until the post response is fetched.
      await wait(() => restClient.verifyAll());

      expect(postStore.state.loading).to.be.true;

      const r = new Promise(resolve => {
        postStore.subscribe(state => {
          if (!state.loading) {
            // @ts-ignore
            const authorStore = state.response.author;

            expect(authorStore.state.loading).to.be.false;
            resolve();
          }
        });
      });

      resolveAuthor(authorResponse);

      return r;
    });
  });
});
