import React from 'react';
import { describe, it, $render, expect, wait } from '../suite';
import RestStore, { RestViewProps } from '../../../src/rest-store';
import { createReactStub } from 'react-mock-component';
import TransportLayer from '../../../src/transport-layer';
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
      ).returns(() => Promise.resolve(data)).verifiable();

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

      transportLayer.verifyAll();
    });
  });
});
