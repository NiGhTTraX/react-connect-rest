import { describe, it, expect } from './suite';
import { Mock } from 'typemoq';
import RestStore2 from '../../src/components/rest-store2';
import TransportLayer from '../../src/lib/transport-layer';

describe('RestStore', () => {
  it('should make a request when created', () => {
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => new Promise(() => {}))
      .verifiable();

    const store = new RestStore2(transportLayer.object, ':api:');

    // @ts-ignore TODO: fix in container
    expect(store.state.loading).to.be.true;
    // @ts-ignore
    expect(store.state.response).to.be.empty;

    transportLayer.verifyAll();
  });

  it('should store the response', () => {
    const response = [{ id: 1 }, { id: 2 }];
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve(response))
      .verifiable();

    const store = new RestStore2(transportLayer.object, ':api:');

    return new Promise(resolve => {
      store.addListener(() => {
        // @ts-ignore TODO: fix in container
        expect(store.state.loading).to.be.false;
        // @ts-ignore
        expect(store.state.response)
          .to
          .deep
          .equal(response);

        transportLayer.verifyAll();
        resolve();
      });
    });
  });

  it('should make a POST request', async () => {
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([]));

    const store = new RestStore2(transportLayer.object, ':api:');

    const response = { id: 1, foo: 'bar' };

    transportLayer
      .setup(x => x.post(':api:', { foo: 'bar' }))
      .returns(() => Promise.resolve(response))
      .verifiable();

    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([response]));

    await store.post({ foo: 'bar' });

    // @ts-ignore TODO: fix in container
    expect(store.state.loading).to.be.false;
    // @ts-ignore
    expect(store.state.response).to.deep.equal([response]);

    transportLayer.verifyAll();
  });
});
