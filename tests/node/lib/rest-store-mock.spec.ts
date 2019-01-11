import { describe, it, expect, wait } from '../suite';
import { RestStoreMock } from '../../../src/lib/rest-store';

describe('RestStoreMock', () => {
  it('should have an initial state', () => {
    const mock = new RestStoreMock();

    expect(mock.state).to.deep.equal({ loading: true, response: [] });
  });

  it('should fetch the mocked state', async () => {
    const response = [{ foo: 'bar' }];
    const mock = new RestStoreMock<{ foo: string }>(response);

    await wait(() => expect(mock.state).to.deep.equal({ loading: false, response: [{ foo: 'bar' }] }));
  });
});
