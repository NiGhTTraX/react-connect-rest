/* eslint-disable no-unused-vars,no-shadow */
import React, { Component, ComponentType } from 'react';
import RestStore, { RestStoreProps, RestViewProps } from './components/rest-store';
import getCollectionNameFromApi from './lib/path-to-name';

export type getDisplayNameFromApi = (url: string) => string;

export type connectToRestOptions<T, ViewProps> = {
  getDisplayNameFromApi?: getDisplayNameFromApi;
  StateWrapper?: ComponentType<RestStoreProps<T, ViewProps>>;
};

type DataViewProps<T, ViewProps = {}> = ViewProps & RestViewProps<T>;

export default function connectToRest<T, ViewProps>(
  View: ComponentType<DataViewProps<T, ViewProps>>,
  api: string,
  options: connectToRestOptions<T, ViewProps> = {}
): ComponentType<ViewProps> {
  const {
    getDisplayNameFromApi = getCollectionNameFromApi,
    StateWrapper = RestStore
  } = options;

  return class ConnectedView extends Component<ViewProps> {
    static displayName = `connect(${View.displayName || View.name}, ${getDisplayNameFromApi(api)})`;

    render() {
      const { props: viewProps } = this;

      return <StateWrapper viewProps={viewProps} View={View} api={api} />;
    }
  };
}
