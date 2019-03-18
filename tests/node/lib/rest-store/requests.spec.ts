import { describe, it, expect } from '../../suite';
import { It, Mock, Times } from 'typemoq';
import StorageClient from '../../../../src/lib/storage-client';
import RestStore, { HATEOASRestResponse } from '../../../../src/lib/rest-store';

describe('RestStore', () => {
  interface Foo {
    id: number;
    foo: string;
  }

  it('should make a GET request when created', () => {
    const transportLayer = Mock.ofType<StorageClient>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => new Promise(() => {}))
      .verifiable(Times.once());

    // eslint-disable-next-line no-new
    new RestStore<Foo>(':api:', transportLayer.object);

    transportLayer.verifyAll();
  });

  it('should have an initial state', () => {
    const transportLayer = Mock.ofType<StorageClient>();
    transportLayer
      .setup(x => x.get(It.isAny()))
      .returns(() => new Promise(() => {}))
      .verifiable();

    const store = new RestStore<Foo>(':irrelevant:', transportLayer.object);

    expect(store.state.loading).to.be.true;
    expect(store.state.response).to.be.undefined;
  });

  it('should store the GET response', async () => {
    const response: HATEOASRestResponse<Foo[]> = {
      data: [
        { __links: [], id: 1, foo: 'bar' },
        { __links: [], id: 2, foo: 'baz' }
      ]
    };

    const transportLayer = Mock.ofType<StorageClient>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve(response))
      .verifiable();

    const store = new RestStore<Foo>(':api:', transportLayer.object);

    await new Promise(resolve => store.subscribe(resolve));

    expect(store.state.loading).to.be.false;
    expect(store.state.response).to.deep.equal([
      { id: 1, foo: 'bar' },
      { id: 2, foo: 'baz' }
    ]);

    transportLayer.verifyAll();
  });
});
