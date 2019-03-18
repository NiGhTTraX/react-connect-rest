import { Mock } from 'typemoq';
import { describe, expect, it } from '../../suite';
import RestStore, { HATEOASRestResponse } from '../../../../src/lib/rest-store';
import HttpClient from '../../../../src/lib/http-client';

describe('RestStore', () => {
  describe('relations', () => {
    it('should leave primitives alone', async () => {
      interface Post {
        id: number;
        title: string;
      }

      const postResponse: HATEOASRestResponse<Post[]> = {
        data: [{ __links: [], id: 1, title: 'item 1' }]
      };

      const transportLayer = Mock.ofType<HttpClient>();

      transportLayer
        .setup(x => x.get(':post-api:'))
        .returns(() => Promise.resolve(postResponse))
        .verifiable();

      const postStore = new RestStore<Post[]>(':post-api:', transportLayer.object);

      await new Promise(resolve => postStore.subscribe(resolve));

      expect(postStore.state.response).to.deep.equal([{ id: 1, title: 'item 1' }]);
    });

    it('should transform a to many relation into a collection store', async () => {
      interface Item {
        id: number;
        title: string;
      }

      interface Collection {
        id: number;
        items: Item[];
      }

      const collectionResponse: HATEOASRestResponse<Collection[]> = {
        data: [{
          __links: [{ rel: 'items', href: ':item-api:' }],
          id: 1,
          items: [1]
        }]
      };

      const itemResponse: HATEOASRestResponse<Item[]> = {
        data: [{
          __links: [],
          id: 1,
          title: 'item 1'
        }]
      };

      const transportLayer = Mock.ofType<HttpClient>();

      transportLayer
        .setup(x => x.get(':collection-api:'))
        .returns(() => Promise.resolve(collectionResponse))
        .verifiable();

      transportLayer
        .setup(x => x.get(':item-api:'))
        .returns(() => Promise.resolve(itemResponse))
        .verifiable();

      const collectionStore = new RestStore<Collection[]>(':collection-api:', transportLayer.object);

      await new Promise(resolve => collectionStore.subscribe(resolve));

      // @ts-ignore
      const collection = collectionStore.state.response[0];

      expect(
        collection.items,
        'The relation was not transformed'
      ).to.not.deep.equal([1]);

      const itemsStore = collection.items;

      expect(itemsStore.state.response[0]).to.deep.equal({ id: 1, title: 'item 1' });
    });

    it('should transform a to single relation into an entity store', async () => {
      interface Author {
        id: number;
        name: string;
      }

      interface Post {
        id: number;
        author: Author;
      }

      const postResponse: HATEOASRestResponse<Post[]> = {
        data: [{
          __links: [{ rel: 'author', href: ':author-api:' }],
          id: 1,
          author: 1
        }]
      };
      const authorResponse: HATEOASRestResponse<Author> = {
        data: {
          __links: [],
          id: 1,
          name: 'author 1'
        }
      };

      const transportLayer = Mock.ofType<HttpClient>();

      transportLayer
        .setup(x => x.get(':post-api:'))
        .returns(() => Promise.resolve(postResponse))
        .verifiable();

      transportLayer
        .setup(x => x.get(':author-api:'))
        .returns(() => Promise.resolve(authorResponse))
        .verifiable();

      const postStore = new RestStore<Post[]>(':post-api:', transportLayer.object);

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
  });
});
