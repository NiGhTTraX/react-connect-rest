import { Mock, Times } from 'typemoq';
import { describe, expect, it, wait } from '../../suite';
import RestStore from '../../../../src/lib/rest-store';
import HttpRestClient, { RestResponse } from '../../../../src/lib/http-rest-client';
import {
  Author,
  authorResponse,
  authorsResponse,
  Book,
  booksResponse,
  Post,
  postsResponse
} from './fixture';

describe('RestStore', () => {
  describe('collection relations', () => {
    it('should leave primitives alone', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Author[]>(':author-api:'))
        .returns(() => Promise.resolve(authorsResponse))
        .verifiable();

      const authorStore = new RestStore<Author[]>(':author-api:', restClient.object);

      await new Promise(resolve => authorStore.subscribe(resolve));

      expect(authorStore.state.response).to.deep.equal([{ id: 1, name: 'author 1' }]);
    });

    it('should transform a to many relation into a collection store', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Book[]>(':book-api:'))
        .returns(() => Promise.resolve(booksResponse))
        .verifiable();

      restClient
        .setup(x => x.get<Author[]>(':author-api:'))
        .returns(() => Promise.resolve(authorsResponse))
        .verifiable();

      const bookStore = new RestStore<Book[]>(':book-api:', restClient.object);

      await new Promise(resolve => bookStore.subscribe(resolve));

      // @ts-ignore
      const book = bookStore.state.response[0];

      expect(
        book.authors,
        'The relation was not transformed'
      ).to.not.deep.equal([1]);

      const authorsStore = book.authors;

      expect(authorsStore.state.response).to.deep.equal([{ id: 1, name: 'author 1' }]);
    });

    it('should transform a to single relation into an entity store', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Post[]>(':post-api:'))
        .returns(() => Promise.resolve(postsResponse))
        .verifiable();

      restClient
        .setup(x => x.get<Author>(':author-api:'))
        .returns(() => Promise.resolve(authorResponse))
        .verifiable();

      const postStore = new RestStore<Post[]>(':post-api:', restClient.object);

      await new Promise(resolve => postStore.subscribe(resolve));

      // @ts-ignore
      const post = postStore.state.response[0];

      expect(
        post.author,
        'The relation was not transformed'
      ).to.not.deep.equal(1);

      const authorStore = post.author;

      expect(authorStore.state.response).to.deep.equal({ id: 1, name: 'author 1' });
    });

    it('should wait for all child stores', async () => {
      const restClient = Mock.ofType<HttpRestClient>();

      restClient
        .setup(x => x.get<Post[]>(':post-api:'))
        .returns(() => Promise.resolve(postsResponse))
        .verifiable();

      let resolveAuthor: (r: RestResponse<Author>) => void = () => {};

      restClient
        .setup(x => x.get<Author>(':author-api:'))
        .returns(() => new Promise(resolve => { resolveAuthor = resolve; }))
        .verifiable();

      const postStore = new RestStore<Post[]>(':post-api:', restClient.object);

      // Wait until the post response is fetched.
      await wait(() => restClient.verify(x => x.get(':post-api:'), Times.once()));

      expect(postStore.state.loading).to.be.true;

      const r = new Promise(resolve => {
        postStore.subscribe(state => {
          if (!state.loading) {
            // @ts-ignore
            const book = state.response[0];
            expect(book.author.state.loading).to.be.false;
            resolve();
          }
        });
      });

      resolveAuthor(authorResponse);

      return r;
    });
  });
});
