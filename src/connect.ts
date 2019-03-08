import { ComponentType } from 'react';
import connectToState from 'react-connect-state';
import RestStore, { IRestStore } from './lib/rest-store';
import { Omit } from 'react-bind-component';
import FetchTransport from './lib/fetch-transport';

type RestEntity = {
  id: any;
};

type PropsThatAllowContainers<ViewProps, T extends RestEntity> = {
  [P in keyof ViewProps]: ViewProps[P] extends IRestStore<T> ? P : never;
}[keyof ViewProps];

export function connectToRest<
  ViewProps,
  T extends RestEntity,
  K extends PropsThatAllowContainers<ViewProps, T>
>(
  View: ComponentType<ViewProps>,
  api: string,
  prop: K
): ComponentType<Omit<ViewProps, K>>;

export function connectToRest<
  ViewProps,
  T extends RestEntity,
  K extends PropsThatAllowContainers<ViewProps, T>
>(
  View: ComponentType<ViewProps>,
  container: IRestStore<T>,
  prop: K
): ComponentType<Omit<ViewProps, K>>;

/**
 * @param View
 * @param containerOrApi If a string is given then a new state container will be created and
 *   connected to the view. If you call the method again you'll end up with 2 containers that
 *   query the same API. If you want to have a single container connected to multiple views
 *   then create a container separately and pass it here.
 * @param prop
 */
export default function connectToRest<
  ViewProps,
  T extends RestEntity,
  K extends PropsThatAllowContainers<ViewProps, T>
>(
  View: ComponentType<ViewProps>,
  containerOrApi: IRestStore<T> | string,
  prop: K
): ComponentType<Omit<ViewProps, K>> {
  if (typeof containerOrApi === 'string') {
    // @ts-ignore
    return connectToState(View, {
      [prop]: new RestStore(containerOrApi, FetchTransport)
    });
  }

  // @ts-ignore
  return connectToState(View, {
    [prop]: containerOrApi
  });
}
