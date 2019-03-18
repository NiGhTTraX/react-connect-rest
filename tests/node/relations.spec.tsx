import { Mock } from 'typemoq';
import { describe, expect, it } from './suite';
import RelationalStore, { HATEOASRestResponse } from '../../src/lib/relational-store';
import StorageClient from '../../src/lib/storage-client';

describe('RelationalStore', () => {
  it('should leave primitives alone', async () => {
    interface Post {
      id: number;
      title: string;
    }

    const postResponse: HATEOASRestResponse<Post[]> = {
      links: [],
      data: [{ id: 1, title: 'item 1' }]
    };

    const transportLayer = Mock.ofType<StorageClient>();

    transportLayer
      .setup(x => x.get(':post-api:'))
      .returns(() => Promise.resolve(postResponse))
      .verifiable();

    const postStore = new RelationalStore<Post[]>(':post-api:', transportLayer.object);

    await new Promise(resolve => postStore.subscribe(resolve));

    expect(postStore.state.response).to.deep.equal(postResponse.data);
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
      // TODO: this should be on each entity, d'oh
      links: [{ rel: 'items', href: ':item-api:' }],
      data: [{
        id: 1,
        items: [1]
      }]
    };

    const itemResponse: HATEOASRestResponse<Item[]> = {
      links: [],
      data: [{
        id: 1,
        title: 'item 1'
      }]
    };

    const transportLayer = Mock.ofType<StorageClient>();

    transportLayer
      .setup(x => x.get(':collection-api:'))
      .returns(() => Promise.resolve(collectionResponse))
      .verifiable();

    transportLayer
      .setup(x => x.get(':item-api:'))
      .returns(() => Promise.resolve(itemResponse))
      .verifiable();

    const collectionStore = new RelationalStore<Collection[]>(':collection-api:', transportLayer.object);

    await new Promise(resolve => collectionStore.subscribe(resolve));

    // @ts-ignore
    const collection = collectionStore.state.response[0];

    expect(
      collection.items,
      'The relation was not transformed'
    ).to.not.deep.equal([1]);

    const itemsStore = collection.items;

    // await new Promise(resolve => itemsStore.subscribe(resolve));
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
      links: [{ rel: 'author', href: ':author-api:' }],
      data: [{
        id: 1,
        author: 1
      }]
    };
    const authorResponse: HATEOASRestResponse<Author> = {
      links: [],
      data: {
        id: 1,
        name: 'author 1'
      }
    };

    const transportLayer = Mock.ofType<StorageClient>();

    transportLayer
      .setup(x => x.get(':post-api:'))
      .returns(() => Promise.resolve(postResponse))
      .verifiable();

    transportLayer
      .setup(x => x.get(':author-api:'))
      .returns(() => Promise.resolve(authorResponse))
      .verifiable();

    const postStore = new RelationalStore<Post[]>(':post-api:', transportLayer.object);

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
