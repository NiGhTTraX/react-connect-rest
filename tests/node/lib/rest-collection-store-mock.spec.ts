import { describe, expect, it } from '../suite';
import RestCollectionStoreMock from '../../../src/lib/rest-collection-store-mock';

describe('RestCollectionStoreMock', () => {
  it('should have an initial state', () => {
    const mock = new RestCollectionStoreMock();

    expect(mock.state).to.deep.equal({ loading: true, response: [] });
  });

  it('should set the mocked state', () => {
    const response = [{ id: 1, foo: 'bar' }];
    const mock = new RestCollectionStoreMock<{ id: number, foo: string }>(response);

    expect(mock.state).to.deep.equal({ loading: false, response });
  });

  it('should spy on POST requests', async () => {
    const mock = new RestCollectionStoreMock<{ id: number; foo: string }>();
    mock.post.withArgs({ foo: 'bar' }).returns({ id: 1, foo: 'bar' });

    const response = await mock.post({ foo: 'bar' });

    expect(mock.post).to.have.been.calledWith({ foo: 'bar' });
    expect(response).to.deep.equal({ id: 1, foo: 'bar' });
  });
});
