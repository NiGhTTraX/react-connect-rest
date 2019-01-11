import React from 'react';
import { createReactStub } from 'react-mock-component';
import fetchMock from 'fetch-mock';
import { Mock } from 'typemoq';
import { describe, it, afterEach, expect, wait, $render } from './suite';
import connectToRest from '../../src/connect';
import RestStore from '../../src/components/rest-store';

describe('connectToRest', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('should connect the view to a fresh state container', async () => {
    const response = [{ id: 1 }, { id: 2 }];
    fetchMock.get('/api/', response);

    interface ViewProps {
      container: RestStore<any>
    }
    const View = createReactStub<ViewProps>();
    const ConnectedView = connectToRest(View, '/api/', 'container');

    $render(<ConnectedView />);

    await wait(() => expect(View.lastProps.container.state).to.deep.equal({
      loading: false,
      response
    }));
  });

  it('should connect the view to the given state container', async () => {
    const response = [{ id: 1 }, { id: 2 }];
    fetchMock.get('/api/', response);

    interface ViewProps {
      // eslint-disable-next-line no-use-before-define
      container: RestStore<any>
    }
    const View = createReactStub<ViewProps>();
    const container = Mock.ofType<RestStore<any>>();
    const ConnectedView = connectToRest(View, container.object, 'container');

    $render(<ConnectedView />);

    await wait(() => expect(View.renderedWith({ container: container.object })).to.be.true);
  });
});
