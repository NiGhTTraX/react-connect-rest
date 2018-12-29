import React from 'react';
import { describe, it, $render, expect, wait } from '../suite';
import RestStore, { RestViewProps } from '../../../src/components/rest-store';
import { createReactStub } from 'react-mock-component';
import TransportLayer from '../../../src/lib/transport-layer';
import { Mock } from 'typemoq';

interface Foo {
  id: number;
  title: string;
}

interface FooProps extends RestViewProps<Foo>{
  foo: string;
}

describe('RestStore', () => {
  describe('loading', () => {
    it('should render the loading view', async () => {
      const Foo = createReactStub<FooProps>();
      const Loading = createReactStub();
      const viewProps = { foo: 'bar' };

      const transportLayer = Mock.ofType<TransportLayer>();
      transportLayer.setup(
        fake => fake.get<Foo[]>(':some-api:')
      ).returns(() => new Promise(() => {})).verifiable();

      $render(<RestStore
        View={Foo}
        LoadingComponent={Loading}
        viewProps={viewProps}
        api=":some-api:"
        transportLayer={transportLayer.object}
      />);

      await wait(() => expect(Loading.rendered).to.be.true);

      expect(Foo.rendered).to.be.false;

      transportLayer.verifyAll();
    });
  });

  describe('loaded', () => {
    it('should pass the response to the view', async () => {
      const Foo = createReactStub<FooProps>();
      const viewProps = { foo: 'bar' };

      const data = [{
        id: 1,
        title: 'some category'
      }];

      const transportLayer = Mock.ofType<TransportLayer>();
      transportLayer.setup(
        fake => fake.get<Foo[]>(':some-api:')
      ).returns(() => Promise.resolve(data));

      $render(<RestStore
        View={Foo}
        viewProps={viewProps}
        api=":some-api:"
        transportLayer={transportLayer.object}
      />);

      await wait(() => expect(Foo.renderedWith({
        foo: 'bar',
        data
      })));
    });

    it('should post to the endpoint', async () => {
      const Foo = createReactStub<FooProps>();
      const viewProps = { foo: 'bar' };

      const data = [{
        id: 1,
        title: 'some category'
      }];

      const newCategory = {
        id: 2,
        title: 'new category'
      };

      const transportLayer = Mock.ofType<TransportLayer>();

      transportLayer.setup(
        fake => fake.get<Foo[]>(':some-api:')
      ).returns(() => Promise.resolve(data));

      $render(<RestStore
        View={Foo}
        viewProps={viewProps}
        api=":some-api:"
        transportLayer={transportLayer.object}
      />);

      await wait(() => expect(Foo.renderedWith({
        foo: 'bar',
        data
      })));

      transportLayer.setup(
        fake => fake.post<Foo>(':some-api:', {
          title: 'new category'
        })
      ).returns(() => Promise.resolve(newCategory));

      transportLayer.setup(
        fake => fake.get<Foo[]>(':some-api:')
      ).returns(() => Promise.resolve(data.concat([newCategory])));

      await Foo.lastProps.post({ title: 'new category' });

      await wait(() => expect(Foo.renderedWith({ data: data.concat([newCategory]) })));
    });
  });
});
