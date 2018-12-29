import React, { Component, ComponentType } from 'react';
// eslint-disable-next-line no-unused-vars
import RestStore, { RestViewProps } from './rest-store';

export default function connectToRest<T, ViewProps>(
  View: ComponentType<ViewProps & RestViewProps<T>>, api: string
) {
  // eslint-disable-next-line no-unused-vars
  function getCollectionNameFromApi(path: string) {
    // split will return the whole string if the separator is not found.
    return path.split('/')
      .slice(-1)[0];
  }

  return class ConnectedView extends Component<ViewProps> {
    static displayName = `connect(${View.displayName || View.name}, ${getCollectionNameFromApi(
      api)})`;

    render() {
      const { props: viewProps } = this;

      return <RestStore viewProps={viewProps} View={View} api={api} />;
    }
  };
}
