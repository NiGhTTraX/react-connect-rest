import { Mock, Times } from 'typemoq';
import { describe, expect, it, wait } from '../../suite';
import RestStore, { HATEOASRestResponse } from '../../../../src/lib/rest-store';
import HttpClient from '../../../../src/lib/http-client';

describe('RestStore', () => {
  describe('entity relations', () => {
    interface Author {
      id: number;
      name: string;
    }

    interface Post {
      id: number;
      author: Author;
    }

    interface Book {
      id: number;
      authors: Author[];
    }

    const postResponse: HATEOASRestResponse<Post> = {
      data: {
        __links: [{ rel: 'author', href: ':author-api:' }],
        id: 1,
        author: 1
      }
    };

    const bookResponse: HATEOASRestResponse<Book> = {
      data: {
        __links: [{ rel: 'authors', href: ':author-api:' }],
        id: 1,
        authors: [1]
      }
    };

    const authorsResponse: HATEOASRestResponse<Author[]> = {
      data: [{
        __links: [],
        id: 1,
        name: 'author 1'
      }]
    };

    const authorResponse: HATEOASRestResponse<Author> = {
      data: {
        __links: [],
        id: 1,
        name: 'author 1'
      }
    };

    it('should leave primitives alone', async () => {
      const transportLayer = Mock.ofType<HttpClient>();

      transportLayer
        .setup(x => x.get<HATEOASRestResponse<Author>>(':author-api:'))
        .returns(() => Promise.resolve(authorResponse))
        .verifiable();

      const authorStore = new RestStore<Author>(':author-api:', transportLayer.object);

      await new Promise(resolve => authorStore.subscribe(resolve));

      expect(authorStore.state.response).to.deep.equal({ id: 1, name: 'author 1' });
    });

    it('should transform a to many relation into a collection store', async () => {
      const transportLayer = Mock.ofType<HttpClient>();

      transportLayer
        .setup(x => x.get<HATEOASRestResponse<Book>>(':book-api:'))
        .returns(() => Promise.resolve(bookResponse))
        .verifiable();

      transportLayer
        .setup(x => x.get<HATEOASRestResponse<Author[]>>(':author-api:'))
        .returns(() => Promise.resolve(authorsResponse))
        .verifiable();

      const bookStore = new RestStore<Book>(':book-api:', transportLayer.object);

      await new Promise(resolve => bookStore.subscribe(resolve));

      // @ts-ignore
      const authorsStore = bookStore.state.response.authors;

      expect(
        authorsStore,
        'The relation was not transformed'
      ).to.not.deep.equal([1]);

      expect(authorsStore.state.response[0]).to.deep.equal({ id: 1, name: 'author 1' });
    });

    it('should transform a to single relation into an entity store', async () => {
      const transportLayer = Mock.ofType<HttpClient>();

      transportLayer
        .setup(x => x.get<HATEOASRestResponse<Post>>(':post-api:'))
        .returns(() => Promise.resolve(postResponse))
        .verifiable();

      transportLayer
        .setup(x => x.get<HATEOASRestResponse<Author>>(':author-api:'))
        .returns(() => Promise.resolve(authorResponse))
        .verifiable();

      const postStore = new RestStore<Post>(':post-api:', transportLayer.object);

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
      const transportLayer = Mock.ofType<HttpClient>();

      transportLayer
        .setup(x => x.get<HATEOASRestResponse<Post>>(':post-api:'))
        .returns(() => Promise.resolve(postResponse))
        .verifiable();

      let resolveAuthor: (r: HATEOASRestResponse<Author>) => void = () => {};

      transportLayer
        .setup(x => x.get<HATEOASRestResponse<Author>>(':author-api:'))
        .returns(() => new Promise(resolve => { resolveAuthor = resolve; }))
        .verifiable();

      const postStore = new RestStore<Post>(':post-api:', transportLayer.object);

      // Wait until the post response is fetched.
      await wait(() => transportLayer.verify(x => x.get(':post-api:'), Times.once()));

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
