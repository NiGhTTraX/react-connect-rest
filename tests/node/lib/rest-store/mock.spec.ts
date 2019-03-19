import { describe, expect, it } from '../../suite';
import RestStoreMock from '../../../../src/lib/rest-store-mock';

describe('RestStoreMock', () => {
  interface Foo {
    id: number;
  }

  interface Bar {
    id: number;
    foo: Foo;
  }

  it('should have an initial state', () => {
    const mock = new RestStoreMock<Foo>();

    expect(mock.state).to.deep.equal({
      loading: true
    });
  });

  it('should accept entity mocks', () => {
    const mock = new RestStoreMock<Foo>({ id: 1 });

    expect(mock.state).to.deep.equal({
      loading: false,
      response: { id: 1 }
    });
  });

  it('should accept collection mocks', () => {
    const mock = new RestStoreMock<Foo[]>([{ id: 1 }]);

    expect(mock.state).to.deep.equal({
      loading: false,
      response: [{ id: 1 }]
    });
  });

  it('should accept expanded mocks', () => {
    const mock = new RestStoreMock<Bar>({
      id: 1,
      foo: new RestStoreMock<Foo>()
    });

    // @ts-ignore
    expect(mock.state.response.foo.state).to.deep.equal({
      loading: true
    });
  });

  it('should spy on POST requests', async () => {
    const mock = new RestStoreMock<Foo>();

    mock.post.withArgs({ }).returns(Promise.resolve({
      id: 1
    }));

    const reply = await mock.post({ });

    expect(mock.post).to.have.been.calledOnce;
    expect(reply).to.deep.equal({ id: 1 });
  });
});