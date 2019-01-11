import React from 'react';
import { createReactStub } from 'react-mock-component';
import fetchMock from 'fetch-mock';
import { Mock } from 'typemoq';
import { describe, it, afterEach, expect, wait, $render } from './suite';
import connectToRest2 from '../../src/connect2';
import RestStore2 from '../../src/components/rest-store2';

describe('connectToRest2', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('should connect the view to a fresh state container', async () => {
    const response = [{ id: 1 }, { id: 2 }];
    fetchMock.get('/api/', response);

    interface ViewProps {
      container: RestStore2<any>
    }
    const View = createReactStub<ViewProps>();
    const ConnectedView = connectToRest2(View, '/api/', 'container');

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
      container: RestStore2<any>
    }
    const View = createReactStub<ViewProps>();
    const container = Mock.ofType<RestStore2<any>>();
    const ConnectedView = connectToRest2(View, container.object, 'container');

    $render(<ConnectedView />);

    await wait(() => expect(View.renderedWith({ container: container.object })).to.be.true);
  });
});
