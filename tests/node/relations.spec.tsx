import { Mock } from 'typemoq';
import { describe, expect, it } from './suite';
import RelationalStore, {
  HATEOASRest,
  ManyToMany
} from '../../src/lib/relational-store';
import StorageClient from '../../src/lib/storage-client';

describe('RelationalStore', () => {
  it('should leave primitives alone', async () => {
    interface Post {
      id: number;
      title: string;
    }

    const postResponse: HATEOASRest<Post[]> = {
      links: [],
      data: [{ id: 1, title: 'item 1' }]
    };

    const transportLayer = Mock.ofType<StorageClient>();

    transportLayer
      .setup(x => x.get(':post-api:'))
      .returns(() => Promise.resolve(postResponse))
      .verifiable();

    const postStore = new RelationalStore<Post>(':post-api:', transportLayer.object);

    await new Promise(resolve => postStore.subscribe(resolve));

    expect(postStore.state.response).to.deep.equal(postResponse.data);
  });

  it('should transform a m2m relation into a store', async () => {
    interface Item {
      id: number;
      title: string;
    }

    interface Collection {
      id: number;
      items: ManyToMany<Item>;
    }

    const collectionResponse: HATEOASRest<Collection[]> = {
      links: [{ rel: 'items', href: ':item-api:', type: 'm2m' }],
      data: [{
        id: 1,
        items: [1]
      }]
    };
    const itemResponse: HATEOASRest<Item[]> = {
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

    const collectionStore = new RelationalStore<Collection>(':collection-api:', transportLayer.object);

    await new Promise(resolve => collectionStore.subscribe(resolve));

    expect(
      collectionStore.state.response[0].items,
      'The relation was not transformed'
    ).to.not.deep.equal([1]);

    const itemsStore = collectionStore.state.response[0].items;

    // await new Promise(resolve => itemsStore.subscribe(resolve));
    expect(itemsStore.state.response[0]).to.deep.equal({ id: 1, title: 'item 1' });
  });
});
