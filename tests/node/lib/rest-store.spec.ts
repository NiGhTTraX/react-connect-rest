import { describe, it, expect } from '../suite';
import { Mock } from 'typemoq';
import fetchMock from 'fetch-mock';
import RestStore from '../../../src/lib/rest-store';
import TransportLayer from '../../../src/lib/transport-layer';

describe('RestStore', () => {
  it('should make a request when created', () => {
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => new Promise(() => {}))
      .verifiable();

    const store = new RestStore(':api:', transportLayer.object);

    expect(store.state.loading).to.be.true;
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

    const store = new RestStore(':api:', transportLayer.object);

    return new Promise(resolve => {
      store.addListener(() => {
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

    const store = new RestStore(':api:');

    return new Promise(resolve => {
      store.addListener(() => {
        expect(store.state.loading).to.be.false;
        expect(store.state.response).to.deep.equal(response);

        resolve();
      });
    });
  });

  it('should make a POST request', async () => {
    const transportLayer = Mock.ofType<TransportLayer>();
    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([]));

    const store = new RestStore(':api:', transportLayer.object);

    const response = { id: 1, foo: 'bar' };

    transportLayer
      .setup(x => x.post(':api:', { foo: 'bar' }))
      .returns(() => Promise.resolve(response))
      .verifiable();

    transportLayer
      .setup(x => x.get(':api:'))
      .returns(() => Promise.resolve([response]));

    await store.post({ foo: 'bar' });

    expect(store.state.loading).to.be.false;
    expect(store.state.response).to.deep.equal([response]);

    transportLayer.verifyAll();
  });
});
