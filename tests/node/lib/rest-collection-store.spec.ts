import { describe, it, expect } from '../suite';
import { Mock } from 'typemoq';
import fetchMock from 'fetch-mock';
import RestCollectionStore from '../../../src/lib/rest-collection-store';
import StorageClient from '../../../src/lib/storage-client';

describe('RestCollectionStore', () => {
  it('should make a GET request when created', () => {
    const transportLayer = Mock.ofType<StorageClient>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => new Promise(() => {}))
      .verifiable();

    const store = new RestCollectionStore(':api:', transportLayer.object);

    expect(store.state.loading).to.be.true;
    expect(store.state.response).to.be.empty;

    transportLayer.verifyAll();
  });

  it('should store the GET response', () => {
    const response = [{ id: 1 }, { id: 2 }];
    const transportLayer = Mock.ofType<StorageClient>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve(response))
      .verifiable();

    const store = new RestCollectionStore(':api:', transportLayer.object);

    return new Promise(resolve => {
      store.subscribe(() => {
        expect(store.state.loading).to.be.false;
        expect(store.state.response).to.deep.equal(response);

        transportLayer.verifyAll();
        resolve();
      });
    });
  });

  it('should have a default transport layer', () => {
    const response = [{ id: 1 }, { id: 2 }];
    fetchMock.get(':api:', response);

    const store = new RestCollectionStore(':api:');

    return new Promise(resolve => {
      store.subscribe(() => {
        expect(store.state.loading).to.be.false;
        expect(store.state.response).to.deep.equal(response);

        resolve();
      });
    });
  });

  it('should make a POST request', async () => {
    const transportLayer = Mock.ofType<StorageClient>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([]));

    const store = new RestCollectionStore<{ id: number, foo: string }>(':api:', transportLayer.object);

    const response = { id: 1, foo: 'bar' };

    transportLayer
      .setup(x => x.set(':api:', { foo: 'bar' }))
      .returns(() => Promise.resolve(response))
      .verifiable();

    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([response]));

    const reply = await store.post({ foo: 'bar' });

    expect(store.state.loading).to.be.false;
    expect(store.state.response).to.deep.equal([response]);
    expect(reply).to.deep.equal(response);

    transportLayer.verifyAll();
  });

  it('should make a DELETE request', async () => {
    const transportLayer = Mock.ofType<StorageClient>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([{ id: 1, foo: 'bar' }]));

    const store = new RestCollectionStore<{ id: number, foo: string }>(':api:', transportLayer.object);

    transportLayer
      .setup(x => x.delete(':api:', { id: 1 }))
      .returns(() => Promise.resolve(undefined))
      .verifiable();

    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([]));

    const reply = await store.delete({ id: 1 });

    expect(store.state.loading).to.be.false;
    expect(store.state.response).to.deep.equal([]);
    expect(reply).to.deep.equal([]);

    transportLayer.verifyAll();
  });
});
