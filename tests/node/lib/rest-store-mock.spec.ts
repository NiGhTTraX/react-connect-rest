import { describe, it, expect } from '../suite';
import { RestStoreMock } from '../../../src/lib/rest-store';

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
});
