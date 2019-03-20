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
    const mock = new RestStoreMock<Bar>();
    mock.post.withArgs({ foo: 1 }).returns(Promise.resolve());

    await mock.post({ foo: 1 });

    expect(mock.post).to.have.been.calledWith({ foo: 1 });
  });

  it('should spy on PATCH requests', async () => {
    const mock = new RestStoreMock<Foo>();
    mock.patch.withArgs({ id: 2 }).returns(Promise.resolve());

    await mock.patch({ id: 2 });

    expect(mock.patch).to.have.been.calledWith({ id: 2 });
  });
});
