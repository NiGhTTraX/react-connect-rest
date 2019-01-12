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

  it('should spy on POST requests', () => {
    const mock = new RestStoreMock<{ id: number; foo: string }>();

    mock.post({ foo: 'bar' });

    expect(mock.post).to.have.been.calledWith({ foo: 'bar' });
  });
});
