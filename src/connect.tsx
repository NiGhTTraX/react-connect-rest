/* eslint-disable no-unused-vars */
import React, { Component, ComponentType } from 'react';
import RestStore, { RestViewProps } from './components/rest-store';
import getCollectionNameFromApi from './lib/path-to-name';

export default function connectToRest<T, ViewProps>(
  View: ComponentType<ViewProps & RestViewProps<T>>, api: string,
  {
    collectionNameFromApi: getDisplayNameFromApi = getCollectionNameFromApi,
    StateWrapper = RestStore
  }
) {
  return class ConnectedView extends Component<ViewProps> {
    static displayName = `connect(${View.displayName || View.name}, ${getDisplayNameFromApi(api)})`;

    render() {
      const { props: viewProps } = this;

      return <StateWrapper viewProps={viewProps} View={View} api={api} />;
    }
  };
}
