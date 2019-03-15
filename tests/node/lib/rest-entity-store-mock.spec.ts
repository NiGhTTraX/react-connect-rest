import { describe, expect, it } from '../suite';
import RestEntityStoreMock from '../../../src/lib/rest-entity-store-mock';

describe('RestEntityStoreMock', () => {
  it('should have an initial state', () => {
    const mock = new RestEntityStoreMock();

    expect(mock.state).to.deep.equal({ loading: true, response: null });
  });

  it('should set the mocked state', () => {
    const response = { id: 1, foo: 'bar' };
    const mock = new RestEntityStoreMock<{ id: number, foo: string }>(response);

    expect(mock.state).to.deep.equal({ loading: false, response });
  });

  it('should spy on PATCH requests', async () => {
    const mock = new RestEntityStoreMock<{ id: number; foo: string }>();
    mock.patch.withArgs({ foo: 'bar' }).returns(Promise.resolve({ id: 1, foo: 'bar' }));

    const response = await mock.patch({ foo: 'bar' });

    expect(mock.patch).to.have.been.calledWith({ foo: 'bar' });
    expect(response).to.deep.equal({ id: 1, foo: 'bar' });
  });
});
