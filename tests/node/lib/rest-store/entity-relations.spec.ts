import { Mock, Times } from 'typemoq';
import { describe, expect, it, wait } from '../../suite';
import RestStore from '../../../../src/lib/rest-store';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
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
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Author>(':author-api:'))
        .returns(() => Promise.resolve(authorResponse))
        .verifiable();

      const authorStore = new RestStore<Author>(':author-api:', restClient.object);

      await new Promise(resolve => authorStore.subscribe(resolve));

      expect(authorStore.state.response).to.deep.equal({ id: 1, name: 'author 1' });
    });

    it('should leave arrays alone', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<ArrayModel>(':number-api:'))
        .returns(() => Promise.resolve({ data: { __links: [], id: 1, numbers: [1, 2, 3] } }))
        .verifiable();

      const store = new RestStore<ArrayModel>(':number-api:', restClient.object);

      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.response).to.deep.equal({ id: 1, numbers: [1, 2, 3] });
    });

    it('should leave expanded to many relations alone', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Book>(':book-api:'))
        .returns(() => Promise.resolve({
          data: {
            __links: { authors: ':authors-api:' },
            id: 1,
            authors: [{
              id: 1,
              name: 'author 1'
            }]
          }
        }))
        .verifiable();

      const store = new RestStore<Book>(':book-api:', restClient.object);

      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.response).to.deep.equal({
        id: 1,
        authors: [{
          id: 1,
          name: 'author 1'
        }]
      });
    });

    it('should leave expanded to single relations alone', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Post>(':post-api:'))
        .returns(() => Promise.resolve({
          data: {
            __links: { author: ':authors-api:' },
            id: 1,
            author: {
              id: 1,
              name: 'author 1'
            }
          }
        }))
        .verifiable();

      const store = new RestStore<Post>(':post-api:', restClient.object);

      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.response).to.deep.equal({
        id: 1,
        author: {
          id: 1,
          name: 'author 1'
        }
      });
    });

    it('should transform a to many relation into a collection store', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Book>(':book-api:'))
        .returns(() => Promise.resolve(bookResponse))
        .verifiable();

      restClient
        .setup(x => x.get<Author[]>(':author-api:'))
        .returns(() => Promise.resolve(authorsResponse))
        .verifiable();

      const bookStore = new RestStore<Book>(':book-api:', restClient.object);

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
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Post>(':post-api:'))
        .returns(() => Promise.resolve(postResponse))
        .verifiable();

      restClient
        .setup(x => x.get<Author>(':author-api:'))
        .returns(() => Promise.resolve(authorResponse))
        .verifiable();

      const postStore = new RestStore<Post>(':post-api:', restClient.object);

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
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Post>(':post-api:'))
        .returns(() => Promise.resolve(postResponse))
        .verifiable();

      let resolveAuthor: (r: RestResponse<Author>) => void = () => {};

      restClient
        .setup(x => x.get<Author>(':author-api:'))
        .returns(() => new Promise(resolve => { resolveAuthor = resolve; }))
        .verifiable();

      const postStore = new RestStore<Post>(':post-api:', restClient.object);

      // Wait until the post response is fetched.
      await wait(() => restClient.verify(x => x.get(':post-api:'), Times.once()));

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
