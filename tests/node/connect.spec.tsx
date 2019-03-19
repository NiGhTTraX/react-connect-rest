import React from 'react';
import createReactMock from 'react-mock-component';
import fetchMock from 'fetch-mock';
import { Mock } from 'typemoq';
import { describe, it, afterEach, beforeEach, expect, wait, $render } from './suite';
import connectToRest from '../../src/connect';
import { HATEOASRestResponse, IRestStore } from '../../src/lib/rest-store';

describe('connectToRest', () => {
  interface Foo {
    id: number;
  }

  interface ViewProps {
    container: IRestStore<Foo>
  }

  const response: HATEOASRestResponse<Foo[]> = {
    data: [{
      __links: [],
      id: 1
    }, {
      __links: [],
      id: 2
    }]
  };

  beforeEach(() => {
    fetchMock.get('/api/', response);
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should connect the view to a fresh state container', async () => {
    const View = createReactMock<ViewProps>();
    const ConnectedView = connectToRest(View, '/api/', 'container');

    $render(<ConnectedView />);

    await wait(() => expect(View.lastProps.container.state).to.deep.equal({
      loading: false,
      response
    }));
  });

  it('should connect the view to the given state container', async () => {
    const View = createReactMock<ViewProps>();
    const container = Mock.ofType<IRestStore<any>>();
    const ConnectedView = connectToRest(View, container.object, 'container');

    $render(<ConnectedView />);

    await wait(() => expect(View.renderedWith({ container: container.object })).to.be.true);
  });
});
