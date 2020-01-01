import { $render, wait } from '@tdd-buffet/react';
import fetchMock from 'fetch-mock';
import React from 'react';
import createReactMock from 'react-mock-component';
import { expect } from 'tdd-buffet/expect/chai';
import { afterEach, beforeEach, describe, it } from 'tdd-buffet/suite/node';
import connectToRest from '../../src/connect';
import { RestResponse } from '../../src/lib/http-rest-client';
import { IRestStore } from '../../src/lib/rest-store';
import RestStoreMock from '../../src/lib/rest-store-mock';

describe('connectToRest', () => {
  interface Foo {
    id: number;
  }

  interface ViewProps {
    container: IRestStore<Foo>
  }

  const response: RestResponse<Foo[]> = {
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
    const ConnectedView = connectToRest(View, { container: '/api/' });

    $render(<ConnectedView />);

    await wait(() => expect(View.lastProps.container.state).to.deep.equal({
      loading: false,
      response: [{ id: 1 }, { id: 2 }]
    }));
  });

  it('should connect the view to the given state container', async () => {
    const View = createReactMock<ViewProps>();
    const container = new RestStoreMock();
    const ConnectedView = connectToRest(View, { container });

    $render(<ConnectedView />);

    await wait(() => expect(View.renderedWith({ container })).to.be.true);
  });
});
