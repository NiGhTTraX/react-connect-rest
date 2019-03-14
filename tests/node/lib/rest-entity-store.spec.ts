import { describe, it, expect } from '../suite';
import { Mock } from 'typemoq';
import RestEntityStore from '../../../src/lib/rest-entity-store';
import TransportLayer from '../../../src/lib/transport-layer';

describe('RestEntityStore', () => {
  it('should make a GET request when created', () => {
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => new Promise(() => {}))
      .verifiable();

    const store = new RestEntityStore(':api:', transportLayer.object);

    expect(store.state.loading).to.be.true;
    expect(store.state.response).to.be.empty;

    transportLayer.verifyAll();
  });

  it('should store the GET response', () => {
    const response = [{ id: 1 }, { id: 2 }];
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve(response))
      .verifiable();

    const store = new RestEntityStore(':api:', transportLayer.object);

    return new Promise(resolve => {
      store.subscribe(() => {
        expect(store.state.loading).to.be.false;
        expect(store.state.response).to.deep.equal(response);

        transportLayer.verifyAll();
        resolve();
      });
    });
  });

  it('should make a PATCH request', async () => {
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([]));

    const store = new RestEntityStore<{ id: number, foo: string }>(':api:', transportLayer.object);

    const response = { id: 1, foo: 'baz' };

    transportLayer
      .setup(x => x.patch(':api:', { foo: 'baz' }))
      .returns(() => Promise.resolve(response))
      .verifiable();

    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve(response));

    const reply = await store.patch({ foo: 'baz' });

    expect(store.state.loading).to.be.false;
    expect(store.state.response).to.deep.equal(response);
    expect(reply).to.deep.equal(response);

    transportLayer.verifyAll();
  });
});
