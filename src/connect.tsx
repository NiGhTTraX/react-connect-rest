/* eslint-disable no-unused-vars,no-shadow */
import React, { Component, ComponentType } from 'react';
import RestStore, { RestStoreProps, RestViewProps } from './components/rest-store';
import getCollectionNameFromApi from './lib/path-to-name';

export type getDisplayNameFromApi = (url: string) => string;

export type connectToRestOptions<T, ViewProps> = {
  getDisplayNameFromApi: getDisplayNameFromApi;
  StateWrapper: ComponentType<RestStoreProps<T, ViewProps>>;
};

export default function connectToRest<T, ViewProps>(
  View: ComponentType<ViewProps & RestViewProps<T>>, api: string,
  {
    getDisplayNameFromApi = getCollectionNameFromApi,
    StateWrapper = RestStore
  }: connectToRestOptions<T, ViewProps>
) {
  return class ConnectedView extends Component<ViewProps> {
    static displayName = `connect(${View.displayName || View.name}, ${getDisplayNameFromApi(api)})`;

    render() {
      const { props: viewProps } = this;

      return <StateWrapper viewProps={viewProps} View={View} api={api} />;
    }
  };
}
