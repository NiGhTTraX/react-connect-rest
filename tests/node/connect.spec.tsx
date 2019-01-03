/* eslint-disable no-shadow */
import React from 'react';
import { describe, it, afterEach, $render, expect } from './suite';
import { RestStoreProps, RestViewProps } from '../../src/components/rest-store';
import { createReactStub } from 'react-mock-component';
import { Mock } from 'typemoq';
import connectToRest, { getDisplayNameFromApi } from '../../src/connect';
import fetchMock from 'fetch-mock';

describe('connectToRest', () => {
  afterEach(() => { fetchMock.reset(); });

  it('should wrap the view in the state wrapper', () => {
    interface ViewProps {
      foo: string;
    }

    const View = createReactStub<ViewProps & RestViewProps<number>>();
    const StateWrapper = createReactStub<RestStoreProps<number, ViewProps>>();
    const getDisplayNameStub = Mock.ofType<getDisplayNameFromApi>();

    const ConnectedComponent = connectToRest(View, '/some/api/', {
      getDisplayNameFromApi: getDisplayNameStub.object,
      StateWrapper
    });

    $render(<ConnectedComponent foo="bar" />);

    expect(StateWrapper.renderedWith({
      View,
      api: '/some/api/',
      viewProps: {
        foo: 'bar'
      }
    }));

    getDisplayNameStub.verifyAll();
  });

  it('should have a proper display name', () => {
    const View = createReactStub<RestViewProps<any>>();
    const StateWrapper = createReactStub<RestStoreProps<any, {}>>();

    const getDisplayNameStub = Mock.ofType<getDisplayNameFromApi>();
    getDisplayNameStub.setup(x => x('/some/api/')).returns(() => 'collection').verifiable();

    const ConnectedComponent = connectToRest(View, '/some/api/', {
      getDisplayNameFromApi: getDisplayNameStub.object,
      StateWrapper
    });

    $render(<ConnectedComponent />);

    expect(ConnectedComponent.displayName).to.contain('collection');
  });

  it('should have sane defaults', () => {
    const View = createReactStub<RestViewProps<any>>();

    fetchMock.get('/some/api/collection/', []);

    const ConnectedComponent = connectToRest<any, {}>(View, '/some/api/collection/');

    $render(<ConnectedComponent />);

    expect(ConnectedComponent.displayName).to.contain('collection');
  });
});