import { describe, it, expect } from '../suite';
import { RestStoreMock } from '../../../src';

describe('RestStoreMock', () => {
  it('should have an initial state', () => {
    const mock = new RestStoreMock();

    expect(mock.state).to.deep.equal({ loading: true, response: [] });
  });

  it('should set the mocked state', () => {
    const response = [{ foo: 'bar' }];
    const mock = new RestStoreMock<{ foo: string }>(response);

    expect(mock.state).to.deep.equal({ loading: false, response });
  });

  it('should spy on POST requests', async () => {
    const mock = new RestStoreMock<{ id: number; foo: string }>();
    mock.post.withArgs({ foo: 'bar' }).returns({ id: 1, foo: 'bar' });

    const response = await mock.post({ foo: 'bar' });

    expect(mock.post).to.have.been.calledWith({ foo: 'bar' });
    expect(response).to.deep.equal({ id: 1, foo: 'bar' });
  });

  it('should spy on PATCH requests', async () => {
    const mock = new RestStoreMock<{ id: number; foo: string }>();
    mock.patch.withArgs({ foo: 'bar' }).returns({ id: 1, foo: 'bar' });

    const response = await mock.patch({ foo: 'bar' });

    expect(mock.patch).to.have.been.calledWith({ foo: 'bar' });
    expect(response).to.deep.equal({ id: 1, foo: 'bar' });
  });
});
