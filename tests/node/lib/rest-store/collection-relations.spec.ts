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
  booksResponse,
  Post,
  postsResponse
} from './fixture';

describe('RestStore', () => {
  describe('collection relations', () => {
    it('should leave primitives alone', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Author[]>(':author-api:'))
        .returns(Promise.resolve(authorsResponse));

      const authorStore = new RestStore<Author[]>(':author-api:', restClient.stub);

      await new Promise(resolve => authorStore.subscribe(resolve));

      expect(authorStore.state.response).to.deep.equal([{ id: 1, name: 'author 1' }]);
    });

    it('should leave arrays alone', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<ArrayModel[]>(':number-api:'))
        .returns(Promise.resolve({ data: [{ __links: [], id: 1, numbers: [1, 2, 3] }] }));

      const store = new RestStore<ArrayModel[]>(':number-api:', restClient.stub);

      await new Promise(resolve => store.subscribe(resolve));

      expect(store.state.response).to.deep.equal([{ id: 1, numbers: [1, 2, 3] }]);
    });


    it('should transform a to many relation into a collection store', async () => {
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Book[]>(':book-api:'))
        .returns(Promise.resolve(booksResponse));

      restClient
        .when(x => x.get<Author[]>(':author-api:'))
        .returns(Promise.resolve(authorsResponse));

      const bookStore = new RestStore<Book[]>(':book-api:', restClient.stub);

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
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Post[]>(':post-api:'))
        .returns(Promise.resolve(postsResponse));

      restClient
        .when(x => x.get<Author>(':author-api:'))
        .returns(Promise.resolve(authorResponse));

      const postStore = new RestStore<Post[]>(':post-api:', restClient.stub);

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
      const restClient = new Mock<HttpRestClient>();

      restClient
        .when(x => x.get<Post[]>(':post-api:'))
        .returns(Promise.resolve(postsResponse));

      let resolveAuthor: (r: RestResponse<Author>) => void = () => {};

      restClient
        .when(x => x.get<Author>(':author-api:'))
        .returns(new Promise(resolve => { resolveAuthor = resolve; }));

      const postStore = new RestStore<Post[]>(':post-api:', restClient.stub);

      // Wait until the post response is fetched.
      await wait(() => restClient.verifyAll());

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
