import { ComponentType } from 'react';
import connectToState, { PropsThatAllowContainers } from 'react-connect-state';
import { Omit } from 'react-bind-component';
import FetchClient from './lib/fetch-client';
import RestStore, { IRestStore } from './lib/rest-store';

type BindableContainers<ViewProps> = {
  // eslint-disable-next-line max-len
  [P in PropsThatAllowContainers<ViewProps, IRestStore<any>>]: ViewProps[P] extends IRestStore<infer U>
    ? IRestStore<U> | string
    : never
};

export default function connectToRest<
  ViewProps,
  K extends PropsThatAllowContainers<ViewProps, IRestStore<any>>
>(
  View: ComponentType<ViewProps>,
  containers: BindableContainers<ViewProps>
): ComponentType<Omit<ViewProps, K>> {
  // @ts-ignore
  return connectToState(View, Object.keys(containers).reduce((acc, key) => {
    // @ts-ignore
    const containerOrApi = containers[key];

    return {
      ...acc,
      [key]: typeof containerOrApi === 'string'
        ? new RestStore(containerOrApi, FetchClient)
        : containerOrApi
    };
  }, {}));
}
